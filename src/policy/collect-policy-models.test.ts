import {
  annotation,
  field,
  namedType,
  objectLiteral,
  objectType,
  primitiveType,
  schema,
  stringLiteral,
  typeDef,
} from "@varavel/vdl-plugin-sdk/testing";
import { describe, expect, it } from "vitest";
import { collectPolicyModels } from "./collect-policy-models";

/**
 * Builds a @policy annotation with allow and optional deny.
 */
function policyAnnotation(allow: string, deny?: string) {
  const entries: Record<string, ReturnType<typeof stringLiteral>> = {
    allow: stringLiteral(allow),
  };
  if (deny !== undefined) {
    entries.deny = stringLiteral(deny);
  }
  return annotation("policy", objectLiteral(entries));
}

describe("collectPolicyModels", () => {
  it("collects a principal-only policy", () => {
    const ir = schema({
      types: [
        typeDef("User", objectType([field("role", primitiveType("string"))])),
        typeDef(
          "CanAccessPanel",
          objectType([field("principal", namedType("User"))]),
          { annotations: [policyAnnotation("principal.role == 'admin'")] },
        ),
      ],
    });
    const models = collectPolicyModels(ir);
    expect(models).toHaveLength(1);
    expect(models[0]?.goName).toBe("CanAccessPanel");
    expect(models[0]?.principalGoName).toBe("User");
    expect(models[0]?.resourceGoName).toBeUndefined();
    expect(models[0]?.deny).toBeUndefined();
  });

  it("sorts policies by name and keeps deny", () => {
    const ir = schema({
      types: [
        typeDef("User", objectType([field("id", primitiveType("string"))])),
        typeDef("CanB", objectType([field("principal", namedType("User"))]), {
          annotations: [policyAnnotation("true", "false")],
        }),
        typeDef("CanA", objectType([field("principal", namedType("User"))]), {
          annotations: [policyAnnotation("true")],
        }),
      ],
    });
    const models = collectPolicyModels(ir);
    expect(models.map((item) => item.name)).toEqual(["CanA", "CanB"]);
    expect(models[1]?.deny?.kind).toBe("literal");
  });

  it("ignores types without @policy", () => {
    const ir = schema({
      types: [
        typeDef("User", objectType([field("id", primitiveType("string"))])),
      ],
    });
    expect(collectPolicyModels(ir)).toEqual([]);
  });

  it("throws on Go name collisions", () => {
    const ir = schema({
      types: [
        typeDef("User", objectType([field("id", primitiveType("string"))])),
        typeDef(
          "Can_Read",
          objectType([field("principal", namedType("User"))]),
          { annotations: [policyAnnotation("true")] },
        ),
        typeDef(
          "CanRead",
          objectType([field("principal", namedType("User"))]),
          { annotations: [policyAnnotation("true")] },
        ),
      ],
    });
    expect(() => collectPolicyModels(ir)).toThrowError(/collides/);
  });

  it("propagates SDK validation errors", () => {
    const ir = schema({
      types: [
        typeDef(
          "CanBroken",
          objectType([field("principal", namedType("User"))]),
          { annotations: [policyAnnotation("principal.missing == 'x'")] },
        ),
      ],
    });
    expect(() => collectPolicyModels(ir)).toThrowError();
  });

  it("captures deprecation metadata", () => {
    const ir = schema({
      types: [
        typeDef("User", objectType([field("id", primitiveType("string"))])),
        typeDef("CanOld", objectType([field("principal", namedType("User"))]), {
          annotations: [
            policyAnnotation("true"),
            annotation("deprecated", stringLiteral("Use CanNew.")),
          ],
        }),
      ],
    });
    const models = collectPolicyModels(ir);
    expect(models[0]?.isDeprecated).toBe(true);
    expect(models[0]?.deprecationMessage).toBe("Use CanNew.");
  });
});
