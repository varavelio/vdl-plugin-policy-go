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
import { renderGoExpr } from "./render-go-expr";

/**
 * Asserts a value is defined and narrows its type.
 */
function assertDefined<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error("Expected value to be defined.");
  }
  return value;
}

/**
 * Builds schema IR with common User, Invoice and SessionContext types.
 */
function baseTypes() {
  return [
    typeDef(
      "User",
      objectType([
        field("id", primitiveType("string")),
        field("role", primitiveType("string")),
        field("department", primitiveType("string"), { optional: true }),
        field("disabled", primitiveType("bool")),
        field("age", primitiveType("int")),
        field("score", primitiveType("float")),
        field("profile", namedType("Profile"), { optional: true }),
      ]),
    ),
    typeDef(
      "Profile",
      objectType([
        field("department", primitiveType("string"), { optional: true }),
      ]),
    ),
    typeDef(
      "Invoice",
      objectType([
        field("ownerId", primitiveType("string")),
        field("status", enumType("InvoiceStatus", "string")),
        field("total", primitiveType("int")),
        field("allowedIds", arrayType(primitiveType("string"))),
      ]),
    ),
    typeDef(
      "SessionContext",
      objectType([
        field("mfaVerified", primitiveType("bool")),
        field("now", primitiveType("datetime")),
      ]),
    ),
  ];
}

function policyExpr(
  allow: string,
  extra?: { deny?: string; resource?: boolean; context?: boolean },
) {
  const entries: Record<string, ReturnType<typeof stringLiteral>> = {
    allow: stringLiteral(allow),
  };
  if (extra?.deny !== undefined) {
    entries.deny = stringLiteral(extra.deny);
  }
  const fields = [field("principal", namedType("User"))];
  if (extra?.resource !== false) {
    fields.push(field("resource", namedType("Invoice")));
  }
  if (extra?.context === true) {
    fields.push(field("context", namedType("SessionContext")));
  }
  const ir = schema({
    enums: [
      enumDef("InvoiceStatus", "string", [
        enumMember("Locked", stringLiteral("Locked")),
        enumMember("Unlocked", stringLiteral("Unlocked")),
      ]),
    ],
    types: [
      ...baseTypes(),
      typeDef("CanTest", objectType(fields), {
        annotations: [annotation("policy", objectLiteral(entries))],
      }),
    ],
  });
  const models = collectPolicyModels(ir);
  const policy = models[0];
  if (!policy) {
    throw new Error("expected policy");
  }
  return { policy, ir };
}

describe("renderGoExpr", () => {
  it("renders equality and logic with parens", () => {
    const { policy, ir } = policyExpr("principal.role == 'admin'");
    expect(renderGoExpr(policy.allow, { schema: ir, typesPrefix: "" })).toBe(
      '(principal.Role == "admin")',
    );
  });

  it("renders deny-first callers can distinguish allow and deny", () => {
    const { policy, ir } = policyExpr("true", {
      deny: "principal.disabled == true",
    });
    expect(
      policy.deny !== undefined
        ? renderGoExpr(policy.deny, { schema: ir, typesPrefix: "" })
        : undefined,
    ).toBe("(principal.Disabled == true)");
  });

  it("makes optional == null-safe", () => {
    const { policy, ir } = policyExpr("principal.department == 'Finance'");
    expect(renderGoExpr(policy.allow, { schema: ir, typesPrefix: "" })).toBe(
      '((principal.Department != nil) && (*principal.Department) == "Finance")',
    );
  });

  it("makes optional != true when missing", () => {
    const { policy, ir } = policyExpr("principal.department != 'Finance'");
    expect(renderGoExpr(policy.allow, { schema: ir, typesPrefix: "" })).toBe(
      '(!((principal.Department != nil)) || (*principal.Department) != "Finance")',
    );
  });

  it("renders nested has as nil chain", () => {
    const { policy, ir } = policyExpr("has(principal.profile.department)");
    expect(renderGoExpr(policy.allow, { schema: ir, typesPrefix: "" })).toBe(
      "(principal.Profile != nil && principal.Profile.Department != nil)",
    );
  });

  it("renders literal in as or chain without slices", () => {
    const { policy, ir } = policyExpr("principal.role in ['admin', 'owner']");
    expect(renderGoExpr(policy.allow, { schema: ir, typesPrefix: "" })).toBe(
      '((principal.Role == "admin") || (principal.Role == "owner"))',
    );
  });

  it("renders ref array in with slices.Contains", () => {
    const { policy, ir } = policyExpr("principal.id in resource.allowedIds");
    expect(renderGoExpr(policy.allow, { schema: ir, typesPrefix: "" })).toBe(
      "(slices.Contains(resource.AllowedIds, principal.Id))",
    );
  });

  it("renders empty array as false", () => {
    const { policy, ir } = policyExpr("principal.role in []");
    expect(renderGoExpr(policy.allow, { schema: ir, typesPrefix: "" })).toBe(
      "(false)",
    );
  });

  it("maps enum literals to constants", () => {
    const { policy, ir } = policyExpr("resource.status == 'Locked'");
    expect(renderGoExpr(policy.allow, { schema: ir, typesPrefix: "" })).toBe(
      "(resource.Status == InvoiceStatusLocked)",
    );
  });

  it("prefixes enum constants with types import", () => {
    const { policy, ir } = policyExpr("resource.status == 'Locked'");
    expect(
      renderGoExpr(policy.allow, { schema: ir, typesPrefix: "vdltypes." }),
    ).toBe("(resource.Status == vdltypes.InvoiceStatusLocked)");
  });

  it("renders datetime ordering with methods", () => {
    const ir = schema({
      types: [
        typeDef("Event", objectType([field("at", primitiveType("datetime"))])),
        typeDef("Ctx", objectType([field("now", primitiveType("datetime"))])),
        typeDef(
          "CanTest",
          objectType([
            field("principal", namedType("Event")),
            field("resource", namedType("Event")),
            field("context", namedType("Ctx")),
          ]),
          {
            annotations: [
              annotation(
                "policy",
                objectLiteral({
                  allow: stringLiteral("resource.at > context.now"),
                }),
              ),
            ],
          },
        ),
      ],
    });
    const models = collectPolicyModels(ir);
    expect(
      renderGoExpr(assertDefined(models[0]).allow, {
        schema: ir,
        typesPrefix: "",
      }),
    ).toBe("(resource.At.After(context.Now))");
  });

  it("renders not and mixed logic", () => {
    const { policy, ir } = policyExpr(
      "!has(principal.department) || principal.role == 'admin'",
    );
    expect(
      renderGoExpr(policy.allow, { schema: ir, typesPrefix: "" }),
    ).toContain("||");
  });
});
