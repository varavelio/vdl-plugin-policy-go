import type { IrSchema } from "@varavel/vdl-plugin-sdk";
import {
  getDeprecationMessage,
  isDeprecated,
} from "@varavel/vdl-plugin-sdk/utils/deprecations";
import { assertValidIrForPolicy } from "@varavel/vdl-plugin-sdk/utils/policy";
import { fail } from "../shared/errors";
import { toGoTypeName } from "../shared/naming";
import type { PolicyModel } from "./policy-model";

/**
 * Collects validated policies with Go names and deprecation metadata.
 */
export function collectPolicyModels(ir: IrSchema): PolicyModel[] {
  const policies = assertValidIrForPolicy(ir);
  const typesByName = new Map(
    ir.types.map((typeDef) => [typeDef.name, typeDef]),
  );
  const seenGoNames = new Map<string, string>();

  return policies.map((policy) => {
    const goName = toGoTypeName(policy.name);
    const owner = seenGoNames.get(goName);
    if (owner !== undefined && owner !== policy.name) {
      fail(
        `Generated Go function name ${JSON.stringify(goName)} collides for policies ${JSON.stringify(owner)} and ${JSON.stringify(policy.name)}.`,
        policy.position,
      );
    }
    seenGoNames.set(goName, policy.name);

    const typeDef = typesByName.get(policy.name);
    const deprecated = isDeprecated(typeDef?.annotations);
    const message = getDeprecationMessage(typeDef?.annotations);

    return {
      ...policy,
      goName,
      principalGoName: toGoTypeName(policy.principalType),
      ...(policy.resourceType === undefined
        ? {}
        : { resourceGoName: toGoTypeName(policy.resourceType) }),
      ...(policy.contextType === undefined
        ? {}
        : { contextGoName: toGoTypeName(policy.contextType) }),
      ...(typeDef?.doc === undefined ? {} : { doc: typeDef.doc }),
      isDeprecated: deprecated,
      ...(message === undefined ? {} : { deprecationMessage: message }),
    };
  });
}
