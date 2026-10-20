import {
  annotation,
  arrayType,
  enumDef,
  enumMember,
  enumType,
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
import { collectPolicyModels } from "../policy/collect-policy-models";
import { renderGoFile } from "./render-go-file";

describe("renderGoFile", () => {
  it("renders a principal-only policy without imports", () => {
    const ir = schema({
      types: [
        typeDef("User", objectType([field("role", primitiveType("string"))])),
        typeDef(
          "CanAccessPanel",
          objectType([field("principal", namedType("User"))]),
          {
            annotations: [
              annotation(
                "policy",
                objectLiteral({
                  allow: stringLiteral("principal.role == 'admin'"),
                }),
              ),
            ],
          },
        ),
      ],
    });
    const policies = collectPolicyModels(ir);
    const out = renderGoFile(ir, policies, {
      packageName: "policy",
      outFile: "policies.go",
      typesImport: "",
    });
    expect(out).toContain("package policy");
    expect(out).toContain("func canAccessPanel(principal User) bool");
    expect(out).toContain('return (principal.Role == "admin")');
    expect(out).toContain("type VDLPolicyCatalog struct");
    expect(out).toContain("var VDLPolicies = VDLPolicyCatalog{");
    expect(out).toContain('return []string{"CanAccessPanel"}');
    expect(out).not.toContain('"slices"');
    expect(out).not.toContain("vdltypes");
  });

  it("renders deny-first and catalog check references", () => {
    const ir = schema({
      types: [
        typeDef(
          "User",
          objectType([
            field("id", primitiveType("string")),
            field("disabled", primitiveType("bool")),
          ]),
        ),
        typeDef("CanDo", objectType([field("principal", namedType("User"))]), {
          annotations: [
            annotation(
              "policy",
              objectLiteral({
                allow: stringLiteral("true"),
                deny: stringLiteral("principal.disabled == true"),
              }),
            ),
          ],
        }),
      ],
    });
    const policies = collectPolicyModels(ir);
    const out = renderGoFile(ir, policies, {
      packageName: "policy",
      outFile: "policies.go",
      typesImport: "",
    });
    expect(out).toContain("if (principal.Disabled == true) {");
    expect(out).toContain("Check: canDo,");
  });

  it("adds slices import only for ref arrays and types import when set", () => {
    const ir = schema({
      enums: [
        enumDef("InvoiceStatus", "string", [
          enumMember("Locked", stringLiteral("Locked")),
        ]),
      ],
      types: [
        typeDef("User", objectType([field("id", primitiveType("string"))])),
        typeDef(
          "Invoice",
          objectType([
            field("allowedIds", arrayType(primitiveType("string"))),
            field("status", enumType("InvoiceStatus", "string")),
          ]),
        ),
        typeDef(
          "CanRead",
          objectType([
            field("principal", namedType("User")),
            field("resource", namedType("Invoice")),
          ]),
          {
            annotations: [
              annotation(
                "policy",
                objectLiteral({
                  allow: stringLiteral("principal.id in resource.allowedIds"),
                }),
              ),
            ],
          },
        ),
      ],
    });
    const policies = collectPolicyModels(ir);
    const out = renderGoFile(ir, policies, {
      packageName: "policy",
      outFile: "policies.go",
      typesImport: "example.com/project/types",
    });
    expect(out).toContain('"slices"');
    expect(out).toContain('vdltypes "example.com/project/types"');
    expect(out).toContain(
      "func canRead(principal vdltypes.User, resource vdltypes.Invoice) bool",
    );
    expect(out).toContain("slices.Contains");
  });

  it("marks deprecated policies", () => {
    const ir = schema({
      types: [
        typeDef("User", objectType([field("id", primitiveType("string"))])),
        typeDef("CanOld", objectType([field("principal", namedType("User"))]), {
          annotations: [
            annotation(
              "policy",
              objectLiteral({ allow: stringLiteral("true") }),
            ),
            annotation("deprecated", stringLiteral("Use CanNew.")),
          ],
        }),
      ],
    });
    const policies = collectPolicyModels(ir);
    const out = renderGoFile(ir, policies, {
      packageName: "policy",
      outFile: "policies.go",
      typesImport: "",
    });
    expect(out).toContain("// Deprecated: Use CanNew.");
  });
});

describe("renderGoFile order", () => {
  it("renders the catalog before check functions", () => {
    const ir = schema({
      types: [
        typeDef("User", objectType([field("role", primitiveType("string"))])),
        typeDef(
          "CanAccessPanel",
          objectType([field("principal", namedType("User"))]),
          {
            annotations: [
              annotation(
                "policy",
                objectLiteral({
                  allow: stringLiteral("principal.role == 'admin'"),
                }),
              ),
            ],
          },
        ),
      ],
    });
    const policies = collectPolicyModels(ir);
    const out = renderGoFile(ir, policies, {
      packageName: "policy",
      outFile: "policies.go",
      typesImport: "",
    });
    const catalogAt = out.indexOf("type VDLPolicyCatalog struct");
    const funcAt = out.indexOf("func canAccessPanel(principal User) bool");
    expect(catalogAt).toBeGreaterThanOrEqual(0);
    expect(funcAt).toBeGreaterThanOrEqual(0);
    expect(catalogAt).toBeLessThan(funcAt);
  });
});
