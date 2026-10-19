import {
  annotation,
  field,
  namedType,
  objectLiteral,
  objectType,
  pluginInput,
  primitiveType,
  schema,
  stringLiteral,
  typeDef,
} from "@varavel/vdl-plugin-sdk/testing";
import { describe, expect, it } from "vitest";
import { generate } from "./index";

function policySchema(allow = "principal.role == 'admin'") {
  return schema({
    types: [
      typeDef("User", objectType([field("role", primitiveType("string"))])),
      typeDef(
        "CanAccess",
        objectType([field("principal", namedType("User"))]),
        {
          annotations: [
            annotation(
              "policy",
              objectLiteral({ allow: stringLiteral(allow) }),
            ),
          ],
        },
      ),
    ],
  });
}

describe("generate", () => {
  it("returns no files when the schema has no @policy types", () => {
    const output = generate(
      pluginInput({
        ir: schema({
          types: [
            typeDef("User", objectType([field("id", primitiveType("string"))])),
          ],
        }),
      }),
    );
    expect(output.errors).toBeUndefined();
    expect(output.files ?? []).toEqual([]);
  });

  it("uses policy package and policies.go defaults", () => {
    const output = generate(pluginInput({ ir: policySchema() }));
    expect(output.errors).toBeUndefined();
    expect(output.files).toHaveLength(1);
    expect(output.files?.[0]?.path).toBe("policies.go");
    expect(output.files?.[0]?.content).toContain("package policy");
  });

  it("honors package, outFile and typesImport options", () => {
    const output = generate(
      pluginInput({
        options: {
          package: "audit",
          outFile: "audit_policies.go",
          typesImport: "example.com/project/types",
        },
        ir: policySchema(),
      }),
    );
    expect(output.errors).toBeUndefined();
    expect(output.files?.[0]?.path).toBe("audit_policies.go");
    expect(output.files?.[0]?.content).toContain("package audit");
    expect(output.files?.[0]?.content).toContain("vdltypes.User");
  });

  it("reports invalid outFile as errors", () => {
    const output = generate(
      pluginInput({
        options: { outFile: "policies.ts" },
        ir: policySchema(),
      }),
    );
    expect(output.files).toBeUndefined();
    expect(output.errors?.length).toBeGreaterThan(0);
  });

  it("reports invalid policy IR as errors", () => {
    const output = generate(
      pluginInput({
        ir: schema({
          types: [
            typeDef(
              "CanBroken",
              objectType([field("principal", namedType("Missing"))]),
              {
                annotations: [
                  annotation(
                    "policy",
                    objectLiteral({ allow: stringLiteral("true") }),
                  ),
                ],
              },
            ),
          ],
        }),
      }),
    );
    expect(output.errors?.length).toBeGreaterThan(0);
  });
});
