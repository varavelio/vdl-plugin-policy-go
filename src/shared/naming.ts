import { pascalCase } from "@varavel/vdl-plugin-sdk/utils/strings";

const goKeywords = new Set([
  "break",
  "case",
  "chan",
  "const",
  "continue",
  "default",
  "defer",
  "else",
  "fallthrough",
  "for",
  "func",
  "go",
  "goto",
  "if",
  "import",
  "interface",
  "map",
  "package",
  "range",
  "return",
  "select",
  "struct",
  "switch",
  "type",
  "var",
]);

const goPackagePattern = /^[a-z_][a-z0-9_]*$/;

/**
 * Reports whether a value is a reserved Go keyword.
 */
export function isGoKeyword(value: string): boolean {
  return goKeywords.has(value);
}

/**
 * Validates whether a value can be used as a Go package name.
 */
export function isValidGoPackageName(value: string): boolean {
  return goPackagePattern.test(value) && !isGoKeyword(value);
}

/**
 * Converts a VDL symbol name into an exported Go type name.
 */
export function toGoTypeName(value: string): string {
  return escapeGoIdentifier(pascalCase(value));
}

/**
 * Converts a VDL field name into an exported Go struct field name.
 */
export function toGoFieldName(value: string): string {
  return escapeGoIdentifier(pascalCase(value));
}

/**
 * Converts a VDL enum member name into an exported Go enum member name.
 */
export function toGoEnumMemberName(value: string): string {
  return escapeGoIdentifier(pascalCase(value));
}

/**
 * Escapes a Go identifier when it collides with a reserved keyword.
 */
function escapeGoIdentifier(value: string): string {
  return isGoKeyword(value) ? `${value}_` : value;
}
