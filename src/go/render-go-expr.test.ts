import {
  annotation,
  arrayType,
  enumDef,
  enumMember,
  enumType,
  field,
  intLiteral,
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
      '(!(principal.Department != nil) || (*principal.Department) != "Finance")',
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

describe("renderGoExpr edge cases", () => {
  it("maps enum literals on the left side to constants", () => {
    const { policy, ir } = policyExpr("'Unlocked' == resource.status");
    expect(renderGoExpr(policy.allow, { schema: ir, typesPrefix: "" })).toBe(
      "(InvoiceStatusUnlocked == resource.Status)",
    );
  });

  it("expands int literal membership without slices", () => {
    const { policy, ir } = policyExpr("principal.age in [18, 21]");
    const out = renderGoExpr(policy.allow, { schema: ir, typesPrefix: "" });
    expect(out).toBe("((principal.Age == 18) || (principal.Age == 21))");
  });

  it("keeps optional values null-safe inside literal membership", () => {
    const { policy, ir } = policyExpr(
      "has(principal.department) && principal.department in ['Finance', 'Sales']",
    );
    const out = renderGoExpr(policy.allow, { schema: ir, typesPrefix: "" });
    expect(out).toContain('(*principal.Department) == "Finance"');
    expect(out).toContain('(*principal.Department) == "Sales"');
  });

  it("maps int enum literals inside membership lists", () => {
    const ir = schema({
      enums: [
        enumDef("Priority", "int", [
          enumMember("Low", intLiteral(0)),
          enumMember("High", intLiteral(5)),
        ]),
      ],
      types: [
        typeDef("User", objectType([field("id", primitiveType("string"))])),
        typeDef(
          "Ticket",
          objectType([field("priority", enumType("Priority", "int"))]),
        ),
        typeDef(
          "CanTest",
          objectType([
            field("principal", namedType("User")),
            field("resource", namedType("Ticket")),
          ]),
          {
            annotations: [
              annotation(
                "policy",
                objectLiteral({
                  allow: stringLiteral("resource.priority in [5, 0]"),
                }),
              ),
            ],
          },
        ),
      ],
    });
    const policy = assertDefined(collectPolicyModels(ir)[0]);
    const out = renderGoExpr(policy.allow, { schema: ir, typesPrefix: "" });
    expect(out).toContain("resource.Priority == PriorityHigh");
    expect(out).toContain("resource.Priority == PriorityLow");
  });

  it("dereferences optional arrays inside slices.Contains", () => {
    const ir = schema({
      types: [
        typeDef("User", objectType([field("id", primitiveType("string"))])),
        typeDef(
          "Invoice",
          objectType([
            field("allowedIds", arrayType(primitiveType("string")), {
              optional: true,
            }),
          ]),
        ),
        typeDef(
          "CanTest",
          objectType([
            field("principal", namedType("User")),
            field("resource", namedType("Invoice")),
          ]),
          {
            annotations: [
              annotation(
                "policy",
                objectLiteral({
                  allow: stringLiteral(
                    "has(resource.allowedIds) && principal.id in resource.allowedIds",
                  ),
                }),
              ),
            ],
          },
        ),
      ],
    });
    const policy = assertDefined(collectPolicyModels(ir)[0]);
    const out = renderGoExpr(policy.allow, { schema: ir, typesPrefix: "" });
    expect(out).toContain(
      "slices.Contains((*resource.AllowedIds), principal.Id)",
    );
  });

  it("compares optional datetimes through dereferenced values", () => {
    const ir = schema({
      types: [
        typeDef(
          "Invoice",
          objectType([
            field("expiresAt", primitiveType("datetime"), { optional: true }),
          ]),
        ),
        typeDef("Ctx", objectType([field("now", primitiveType("datetime"))])),
        typeDef(
          "CanTest",
          objectType([
            field("principal", namedType("Invoice")),
            field("resource", namedType("Invoice")),
            field("context", namedType("Ctx")),
          ]),
          {
            annotations: [
              annotation(
                "policy",
                objectLiteral({
                  allow: stringLiteral(
                    "has(resource.expiresAt) && resource.expiresAt > context.now",
                  ),
                }),
              ),
            ],
          },
        ),
      ],
    });
    const policy = assertDefined(collectPolicyModels(ir)[0]);
    const out = renderGoExpr(policy.allow, { schema: ir, typesPrefix: "" });
    expect(out).toContain("(*resource.ExpiresAt).After(context.Now)");
  });

  it("compares datetimes with Equal inside membership lists", () => {
    const ir = schema({
      types: [
        typeDef("Event", objectType([field("at", primitiveType("datetime"))])),
        typeDef(
          "Ctx",
          objectType([
            field("a", primitiveType("datetime")),
            field("b", primitiveType("datetime")),
          ]),
        ),
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
                  allow: stringLiteral("resource.at in [context.a, context.b]"),
                }),
              ),
            ],
          },
        ),
      ],
    });
    const policy = assertDefined(collectPolicyModels(ir)[0]);
    const out = renderGoExpr(policy.allow, { schema: ir, typesPrefix: "" });
    expect(out).toContain("resource.At.Equal(context.A)");
    expect(out).toContain("resource.At.Equal(context.B)");
  });
});
