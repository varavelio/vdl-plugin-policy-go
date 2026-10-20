import type { IrSchema } from "@varavel/vdl-plugin-sdk";
import type {
  PolicyArray,
  PolicyExpr,
  PolicyLiteral,
  PolicyRef,
} from "@varavel/vdl-plugin-sdk/utils/policy";
import { fail } from "../shared/errors";
import {
  toGoEnumMemberName,
  toGoFieldName,
  toGoTypeName,
} from "../shared/naming";

/**
 * Context needed to render policy expressions into Go code.
 */
export type ExprContext = {
  schema: IrSchema;
  typesPrefix: string;
};

/**
 * Reports whether the expression tree uses `slices.Contains`.
 */
export function exprUsesSlices(expr: PolicyExpr): boolean {
  switch (expr.kind) {
    case "or":
      return expr.options.some(exprUsesSlices);
    case "and":
      return expr.clauses.some(exprUsesSlices);
    case "not":
      return exprUsesSlices(expr.value);
    case "comparison":
      return exprUsesSlices(expr.left) || exprUsesSlices(expr.right);
    case "in":
      return expr.candidates.kind !== "array";
    case "has":
      return false;
    case "ref":
      return false;
    case "literal":
      return false;
    case "array":
      return expr.items.some(exprUsesSlices);
  }
}

/**
 * Renders a policy expression into a Go boolean expression.
 */
export function renderGoExpr(expr: PolicyExpr, ctx: ExprContext): string {
  switch (expr.kind) {
    case "or": {
      const parts = expr.options.map((item) => renderGoExpr(item, ctx));
      return `(${parts.join(" || ")})`;
    }
    case "and": {
      const parts = expr.clauses.map((item) => renderGoExpr(item, ctx));
      return `(${parts.join(" && ")})`;
    }
    case "not": {
      const inner = renderGoExpr(expr.value, ctx);
      if (inner.startsWith("(")) {
        return `!${inner}`;
      }
      return `!(${inner})`;
    }
    case "comparison": {
      return renderComparison(expr.left, expr.operator, expr.right, ctx);
    }
    case "in": {
      return renderIn(expr.value, expr.candidates, ctx);
    }
    case "has": {
      return renderHas(expr.ref);
    }
    case "ref": {
      return renderRefValue(expr, ctx);
    }
    case "literal": {
      return renderLiteral(expr);
    }
    case "array": {
      return renderArrayLiteral(expr, ctx);
    }
  }
}

/**
 * Maximum single-line width before operands break onto their own lines.
 */
const maxLineWidth = 100;

/**
 * Removes one pair of outer parentheses when they wrap the whole string.
 *
 * Used for `if` conditions, where gofmt strips a redundant outer pair.
 * The expression stays identical because nothing encloses the result.
 */
export function stripOuterParens(rendered: string): string {
  if (!rendered.startsWith("(") || !rendered.endsWith(")")) {
    return rendered;
  }
  let depth = 0;
  for (let index = 0; index < rendered.length; index += 1) {
    if (rendered[index] === "(") {
      depth += 1;
    } else if (rendered[index] === ")") {
      depth -= 1;
    }
    if (depth === 0 && index < rendered.length - 1) {
      return rendered;
    }
  }
  return rendered.slice(1, -1);
}

/**
 * Renders a top-level policy expression, breaking long operand chains.
 */
export function renderTopLevelExpr(
  expr: PolicyExpr,
  ctx: ExprContext,
  indent: string,
): string {
  const flat = renderGoExpr(expr, ctx);
  if (indent.length + flat.length <= maxLineWidth) {
    return flat;
  }
  if (expr.kind !== "or" && expr.kind !== "and") {
    return flat;
  }
  return renderBrokenChain(expr, ctx, indent);
}

/**
 * Renders an `&&` or `||` chain with one operand per line.
 */
function renderBrokenChain(
  expr: { kind: "or" | "and"; options?: PolicyExpr[]; clauses?: PolicyExpr[] },
  ctx: ExprContext,
  indent: string,
): string {
  const operator = expr.kind === "or" ? "||" : "&&";
  const items =
    expr.kind === "or"
      ? (expr.options as PolicyExpr[])
      : (expr.clauses as PolicyExpr[]);
  const nestedIndent = `${indent}\t`;
  const parts = items.map((item, index) =>
    renderBrokenOperand(item, ctx, index === 0 ? indent : nestedIndent),
  );
  const [first, ...rest] = parts as [string, ...string[]];
  if (rest.length === 0) {
    return `(${first})`;
  }
  const lines = [
    `(${first} ${operator}`,
    ...rest.map((part, index) =>
      index === rest.length - 1
        ? `${nestedIndent}${part})`
        : `${nestedIndent}${part} ${operator}`,
    ),
  ];
  return lines.join("\n");
}

/**
 * Renders one operand of a broken chain, breaking nested chains as needed.
 */
function renderBrokenOperand(
  expr: PolicyExpr,
  ctx: ExprContext,
  indent: string,
): string {
  const flat = renderGoExpr(expr, ctx);
  if (indent.length + flat.length <= maxLineWidth) {
    return flat;
  }
  if (expr.kind !== "or" && expr.kind !== "and") {
    return flat;
  }
  return renderBrokenChain(expr, ctx, indent);
}

/**
 * Renders a comparison between two scalar operands.
 */
function renderComparison(
  left: PolicyExpr,
  operator: "==" | "!=" | ">" | ">=" | "<" | "<=",
  right: PolicyExpr,
  ctx: ExprContext,
): string {
  if (
    exprValueType(left) === "datetime" ||
    exprValueType(right) === "datetime"
  ) {
    return renderDatetimeComparison(left, operator, right, ctx);
  }
  if (enumNameOf(left) !== undefined || enumNameOf(right) !== undefined) {
    return renderEnumComparison(left, operator, right, ctx);
  }
  const leftGo = renderOperandValue(left, ctx);
  const rightGo = renderOperandValue(right, ctx);
  const guard = nullSafeGuard(left, right, ctx);
  const direct = `${leftGo} ${operator} ${rightGo}`;
  if (guard === undefined) {
    return `(${direct})`;
  }
  if (operator === "==") {
    return `(${guard} && ${direct})`;
  }
  return `(!${guard} || ${direct})`;
}

/**
 * Returns the scalar key for an operand used in comparisons.
 */
function exprValueType(expr: PolicyExpr): string {
  if (expr.kind === "ref") {
    if (expr.valueType.kind === "enum") {
      return `enum:${expr.valueType.enumName}`;
    }
    return expr.valueType.kind;
  }
  if (expr.kind === "literal") {
    return expr.valueType.kind;
  }
  return "bool";
}

/**
 * Renders either side of a scalar comparison into a Go value.
 */
function renderOperandValue(expr: PolicyExpr, ctx: ExprContext): string {
  if (expr.kind === "ref") {
    return renderRefValue(expr, ctx);
  }
  if (expr.kind === "literal") {
    return renderLiteral(expr);
  }
  return renderGoExpr(expr, ctx);
}

/**
 * Builds the presence guard needed for null-safe `==` and `!=`.
 */
function nullSafeGuard(
  left: PolicyExpr,
  right: PolicyExpr,
  _ctx: ExprContext,
): string | undefined {
  const guards: string[] = [];
  if (left.kind === "ref" && left.optional) {
    guards.push(presenceCondition(left));
  }
  if (right.kind === "ref" && right.optional) {
    guards.push(presenceCondition(right));
  }
  if (guards.length === 0) {
    return undefined;
  }
  if (guards.length === 1) {
    return guards[0];
  }
  return `(${guards.join(" && ")})`;
}

/**
 * Renders a datetime comparison with `Equal`, `Before` and `After`.
 */
function renderDatetimeComparison(
  left: PolicyExpr,
  operator: "==" | "!=" | ">" | ">=" | "<" | "<=",
  right: PolicyExpr,
  ctx: ExprContext,
): string {
  const leftGo = renderOperandValue(left, ctx);
  const rightGo = renderOperandValue(right, ctx);
  const guard = nullSafeGuard(left, right, ctx);
  let call: string;
  switch (operator) {
    case "==":
      call = `${leftGo}.Equal(${rightGo})`;
      break;
    case "!=":
      call = `!(${leftGo}.Equal(${rightGo}))`;
      break;
    case ">":
      call = `${leftGo}.After(${rightGo})`;
      break;
    case ">=":
      call = `${leftGo}.After(${rightGo}) || ${leftGo}.Equal(${rightGo})`;
      break;
    case "<":
      call = `${leftGo}.Before(${rightGo})`;
      break;
    case "<=":
      call = `${leftGo}.Before(${rightGo}) || ${leftGo}.Equal(${rightGo})`;
      break;
  }
  if (guard === undefined) {
    return `(${call})`;
  }
  if (operator === "!=") {
    return `(!${guard} || ${call})`;
  }
  return `(${guard} && ${call})`;
}

/**
 * Renders an enum comparison, mapping string and int literals to constants.
 */
function renderEnumComparison(
  left: PolicyExpr,
  operator: "==" | "!=" | ">" | ">=" | "<" | "<=",
  right: PolicyExpr,
  ctx: ExprContext,
): string {
  const enumName = enumNameOf(left) ?? enumNameOf(right);
  if (enumName === undefined) {
    fail("Cannot resolve enum type for enum comparison.");
  }
  const leftGo = renderEnumOperand(left, enumName, ctx);
  const rightGo = renderEnumOperand(right, enumName, ctx);
  const guard = nullSafeGuard(left, right, ctx);
  const direct = `${leftGo} ${operator} ${rightGo}`;
  if (guard === undefined) {
    return `(${direct})`;
  }
  if (operator === "==") {
    return `(${guard} && ${direct})`;
  }
  if (operator === "!=") {
    return `(!${guard} || ${direct})`;
  }
  return `(${guard} && ${direct})`;
}

/**
 * Returns the enum name carried by a ref or literal operand.
 */
function enumNameOf(expr: PolicyExpr): string | undefined {
  if (expr.kind === "ref" && expr.valueType.kind === "enum") {
    return expr.valueType.enumName;
  }
  return undefined;
}

/**
 * Renders one side of an enum comparison, mapping literals to constants.
 */
function renderEnumOperand(
  expr: PolicyExpr,
  enumName: string,
  ctx: ExprContext,
): string {
  if (expr.kind === "literal") {
    return renderEnumConstant(enumName, expr.value, ctx);
  }
  return renderOperandValue(expr, ctx);
}

/**
 * Renders an `in` expression with `||` chains or `slices.Contains`.
 */
function renderIn(
  value: PolicyExpr,
  candidates: PolicyExpr,
  ctx: ExprContext,
): string {
  if (candidates.kind === "array") {
    if (candidates.items.length === 0) {
      return "(false)";
    }
    if (exprValueType(value) === "datetime") {
      return renderDatetimeIn(value, candidates, ctx);
    }
    const valueEnum = enumNameOf(value) ?? enumNameOfItems(candidates);
    const parts = candidates.items.map((item) => {
      if (valueEnum !== undefined && item.kind === "literal") {
        const leftGo = renderOperandValue(value, ctx);
        const rightGo = renderEnumConstant(valueEnum, item.value, ctx);
        const guard = nullSafeGuard(value, item, ctx);
        const direct = `${leftGo} == ${rightGo}`;
        if (guard === undefined) {
          return `(${direct})`;
        }
        return `(${guard} && ${direct})`;
      }
      if (item.kind === "ref" && item.valueType.kind === "enum") {
        const leftGo = renderOperandValue(value, ctx);
        const rightGo = renderOperandValue(item, ctx);
        const guard = nullSafeGuard(value, item, ctx);
        const direct = `${leftGo} == ${rightGo}`;
        if (guard === undefined) {
          return `(${direct})`;
        }
        return `(${guard} && ${direct})`;
      }
      const leftGo = renderOperandValue(value, ctx);
      const rightGo = renderOperandValue(item, ctx);
      const guard = nullSafeGuard(value, item, ctx);
      const direct = `${leftGo} == ${rightGo}`;
      if (guard === undefined) {
        return `(${direct})`;
      }
      return `(${guard} && ${direct})`;
    });
    if (parts.length === 1) {
      return parts[0] as string;
    }
    return `(${parts.join(" || ")})`;
  }
  const valueGo = renderOperandValue(value, ctx);
  const candidatesGo = renderRefValue(candidates as PolicyRef, ctx);
  const guard = nullSafeGuard(value, candidates, ctx);
  const call = `slices.Contains(${candidatesGo}, ${valueGo})`;
  if (guard === undefined) {
    return `(${call})`;
  }
  return `(${guard} && ${call})`;
}

/**
 * Returns the enum name carried by array items, when any item is an enum ref.
 */
function enumNameOfItems(array: PolicyArray): string | undefined {
  for (const item of array.items) {
    const found = enumNameOf(item);
    if (found !== undefined) {
      return found;
    }
  }
  return undefined;
}

/**
 * Renders datetime membership against a literal array with `Equal`.
 */
function renderDatetimeIn(
  value: PolicyExpr,
  candidates: PolicyArray,
  ctx: ExprContext,
): string {
  const valueGo = renderOperandValue(value, ctx);
  const parts = candidates.items.map((item) => {
    const itemGo = renderOperandValue(item, ctx);
    const guard = nullSafeGuard(value, item, ctx);
    const direct = `${valueGo}.Equal(${itemGo})`;
    if (guard === undefined) {
      return `(${direct})`;
    }
    return `(${guard} && ${direct})`;
  });
  if (parts.length === 1) {
    return parts[0] as string;
  }
  return `(${parts.join(" || ")})`;
}

/**
 * Renders a `has` check into nil comparisons for optional segments.
 */
function renderHas(ref: PolicyRef): string {
  const checks: string[] = [];
  const prefix: string[] = [ref.root];
  for (let index = 0; index < ref.segments.length; index += 1) {
    const segment = ref.segments[index];
    if (segment === undefined) {
      continue;
    }
    prefix.push(toGoFieldName(segment.name));
    if (segment.optional) {
      checks.push(`${prefix.join(".")} != nil`);
    }
  }
  if (checks.length === 0) {
    return "(true)";
  }
  if (checks.length === 1) {
    return `(${checks[0]})`;
  }
  return `(${checks.join(" && ")})`;
}

/**
 * Builds the presence condition used for null-safe operators.
 */
function presenceCondition(ref: PolicyRef): string {
  const inner = renderHas(ref);
  if (inner === "(true)") {
    return "(true)";
  }
  return inner;
}

/**
 * Renders a reference into a Go value, dereferencing optional leaves.
 */
function renderRefValue(ref: PolicyRef, _ctx: ExprContext): string {
  const path = [
    ref.root,
    ...ref.segments.map((item) => toGoFieldName(item.name)),
  ].join(".");
  if (!ref.optional) {
    return path;
  }
  const last = ref.segments[ref.segments.length - 1];
  if (last === undefined || !last.optional) {
    return path;
  }
  if (last.valueType.kind === "object" || last.valueType.kind === "array") {
    if (last.valueType.kind === "array") {
      return `(*${path})`;
    }
    return path;
  }
  return `(*${path})`;
}

/**
 * Renders a scalar literal into a Go literal.
 */
function renderLiteral(expr: PolicyLiteral): string {
  if (typeof expr.value === "string") {
    return JSON.stringify(expr.value);
  }
  if (typeof expr.value === "boolean") {
    return expr.value ? "true" : "false";
  }
  return String(expr.value);
}

/**
 * Renders an inline array literal into a Go slice expression.
 */
function renderArrayLiteral(expr: PolicyArray, ctx: ExprContext): string {
  if (expr.items.length === 0) {
    return "nil";
  }
  const items = expr.items.map((item) => {
    if (item.kind === "literal") {
      if (
        expr.valueType.element !== undefined &&
        typeof expr.valueType.element === "object" &&
        item.valueType.kind !== "enum"
      ) {
        const element = expr.valueType.element as { enumName: string };
        return renderEnumConstant(element.enumName, item.value, ctx);
      }
      return renderLiteral(item);
    }
    return renderGoExpr(item, ctx);
  });
  return `[]any{${items.join(", ")}}`;
}

/**
 * Resolves a string or int literal into a Go enum constant.
 */
function renderEnumConstant(
  enumName: string,
  literal: string | number | boolean,
  ctx: ExprContext,
): string {
  const member = findEnumMember(ctx.schema, enumName, literal);
  if (member === undefined) {
    fail(
      `Cannot resolve enum value ${JSON.stringify(literal)} for enum ${JSON.stringify(enumName)}.`,
    );
  }
  return `${ctx.typesPrefix}${toGoTypeName(enumName)}${toGoEnumMemberName(member)}`;
}

/**
 * Finds the enum member matching a literal by name or explicit value.
 */
function findEnumMember(
  schema: IrSchema,
  enumName: string,
  literal: string | number | boolean,
): string | undefined {
  const enumDef = schema.enums.find((item) => item.name === enumName);
  if (enumDef === undefined) {
    return undefined;
  }
  for (const member of enumDef.members) {
    if (typeof literal === "string" && member.name === literal) {
      return member.name;
    }
    const value = member.value;
    if (
      typeof literal === "string" &&
      value.kind === "string" &&
      value.stringValue === literal
    ) {
      return member.name;
    }
    if (
      typeof literal === "number" &&
      value.kind === "int" &&
      value.intValue === literal
    ) {
      return member.name;
    }
  }
  return undefined;
}
