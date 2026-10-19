import type { ValidatedPolicy } from "@varavel/vdl-plugin-sdk/utils/policy";

/**
 * Validated policy enriched with Go names and deprecation metadata.
 */
export type PolicyModel = ValidatedPolicy & {
  /** Exported Go function name for this policy. */
  goName: string;
  /** Exported Go type name for the principal input. */
  principalGoName: string;
  /** Exported Go type name for the resource input, when present. */
  resourceGoName?: string;
  /** Exported Go type name for the context input, when present. */
  contextGoName?: string;
  /** Policy documentation from the VDL type, when present. */
  doc?: string;
  /** Whether the source type carries `@deprecated`. */
  isDeprecated: boolean;
  /** Human-readable deprecation message, when a string argument exists. */
  deprecationMessage?: string;
};
