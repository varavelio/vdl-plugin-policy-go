import type { PluginInput, PluginOutput } from "@varavel/vdl-plugin-sdk";
import { renderGoFile } from "./go/render-go-file";
import { resolveGeneratorOptions } from "./options/resolve";
import { collectPolicyModels } from "./policy/collect-policy-models";
import { toPluginOutputError } from "./shared/errors";

/**
 * Generates the plugin output for the VDL Go policy plugin.
 */
export function generatePluginOutput(input: PluginInput): PluginOutput {
  try {
    const optionsResult = resolveGeneratorOptions(input);
    if (optionsResult.errors.length > 0 || !optionsResult.options) {
      return { errors: optionsResult.errors };
    }

    const policies = collectPolicyModels(input.ir);
    if (policies.length === 0) {
      return { files: [] };
    }

    return {
      files: [
        {
          path: optionsResult.options.outFile,
          content: renderGoFile(input.ir, policies, optionsResult.options),
        },
      ],
    };
  } catch (error) {
    return { errors: [toPluginOutputError(error)] };
  }
}
