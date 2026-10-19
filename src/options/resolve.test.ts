import { pluginInput } from "@varavel/vdl-plugin-sdk/testing";
import { describe, expect, it } from "vitest";
import { resolveGeneratorOptions } from "./resolve";

/**
 * Builds plugin input with the given raw options.
 */
function inputWith(options: Record<string, string>) {
  return pluginInput({ options });
}

describe("resolveGeneratorOptions", () => {
  it("uses policy and policies.go defaults", () => {
    const result = resolveGeneratorOptions(inputWith({}));
    expect(result.errors).toEqual([]);
    expect(result.options).toEqual({
      packageName: "policy",
      outFile: "policies.go",
      typesImport: "",
    });
  });

  it("trims option values and keeps typesImport", () => {
    const result = resolveGeneratorOptions(
      inputWith({
        package: "  audit  ",
        outFile: "  audit_policies.go  ",
        typesImport: "  example.com/project/types  ",
      }),
    );
    expect(result.errors).toEqual([]);
    expect(result.options).toEqual({
      packageName: "audit",
      outFile: "audit_policies.go",
      typesImport: "example.com/project/types",
    });
  });

  it("falls back to policies.go for blank outFile", () => {
    const result = resolveGeneratorOptions(inputWith({ outFile: "   " }));
    expect(result.errors).toEqual([]);
    expect(result.options?.outFile).toBe("policies.go");
  });

  it("rejects empty package names", () => {
    const result = resolveGeneratorOptions(inputWith({ package: "   " }));
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.options).toBeUndefined();
  });

  it("rejects invalid Go package names", () => {
    for (const bad of ["Policy", "my-policy", "123", "func"]) {
      const result = resolveGeneratorOptions(inputWith({ package: bad }));
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it("rejects outFile values without .go suffix", () => {
    const result = resolveGeneratorOptions(
      inputWith({ outFile: "policies.ts" }),
    );
    expect(result.errors).toEqual([
      {
        message:
          'Invalid outFile "policies.ts". The output file must end with .go.',
      },
    ]);
    expect(result.options).toBeUndefined();
  });
});
