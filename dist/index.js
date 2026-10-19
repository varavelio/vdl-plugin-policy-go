var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  generate: () => generate
});
module.exports = __toCommonJS(index_exports);

// node_modules/@varavel/vdl-plugin-sdk/dist/core/errors.js
var _a;
var PluginError = (_a = class extends Error {
  constructor(message, position) {
    super(message);
    this.name = "PluginError";
    this.position = position;
  }
}, __name(_a, "PluginError"), _a);
function fail(message, position) {
  throw new PluginError(message, position);
}
__name(fail, "fail");

// node_modules/@varavel/vdl-plugin-sdk/dist/core/define-plugin.js
function definePlugin(handler) {
  return (input) => {
    try {
      return handler(input);
    } catch (error) {
      return {
        files: [],
        errors: [toPluginError(error)]
      };
    }
  };
}
__name(definePlugin, "definePlugin");
function toPluginError(error) {
  if (error instanceof PluginError) return {
    message: error.message,
    position: error.position
  };
  if (error instanceof Error) return { message: error.message };
  return { message: "An unknown generation error occurred." };
}
__name(toPluginError, "toPluginError");

// src/shared/errors.ts
var _GenerationError = class _GenerationError extends Error {
  /**
   * Creates a generation error with an optional VDL source position.
   */
  constructor(message, position) {
    super(message);
    __publicField(this, "position");
    this.name = "GenerationError";
    this.position = position;
  }
};
__name(_GenerationError, "GenerationError");
var GenerationError = _GenerationError;
function fail2(message, position) {
  throw new GenerationError(message, position);
}
__name(fail2, "fail");
function toPluginOutputError(error) {
  if (error instanceof GenerationError) {
    return error.position ? { message: error.message, position: error.position } : { message: error.message };
  }
  if (error instanceof Error) {
    const position = error.position;
    return position ? { message: error.message, position } : { message: error.message };
  }
  return { message: "An unknown generation error occurred." };
}
__name(toPluginOutputError, "toPluginOutputError");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/strings/words.js
var ACRONYM_TO_CAPITALIZED_WORD_BOUNDARY_RE = /([A-Z]+)([A-Z][a-z])/g;
var LOWERCASE_OR_DIGIT_TO_UPPERCASE_BOUNDARY_RE = /([a-z0-9])([A-Z])/g;
var NON_ALPHANUMERIC_SEQUENCE_RE = /[^A-Za-z0-9]+/g;
var WHITESPACE_SEQUENCE_RE = /\s+/;
function words(str) {
  const normalized = str.replace(ACRONYM_TO_CAPITALIZED_WORD_BOUNDARY_RE, "$1 $2").replace(LOWERCASE_OR_DIGIT_TO_UPPERCASE_BOUNDARY_RE, "$1 $2").replace(NON_ALPHANUMERIC_SEQUENCE_RE, " ").trim();
  return normalized.length === 0 ? [] : normalized.split(WHITESPACE_SEQUENCE_RE);
}
__name(words, "words");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/strings/pascal-case.js
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
__name(capitalize, "capitalize");
function pascalCase(str) {
  return words(str).map(capitalize).join("");
}
__name(pascalCase, "pascalCase");

// src/shared/naming.ts
var goKeywords = /* @__PURE__ */ new Set([
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
  "var"
]);
var goPackagePattern = /^[a-z_][a-z0-9_]*$/;
function isGoKeyword(value) {
  return goKeywords.has(value);
}
__name(isGoKeyword, "isGoKeyword");
function isValidGoPackageName(value) {
  return goPackagePattern.test(value) && !isGoKeyword(value);
}
__name(isValidGoPackageName, "isValidGoPackageName");
function toGoTypeName(value) {
  return escapeGoIdentifier(pascalCase(value));
}
__name(toGoTypeName, "toGoTypeName");
function toGoFieldName(value) {
  return escapeGoIdentifier(pascalCase(value));
}
__name(toGoFieldName, "toGoFieldName");
function toGoEnumMemberName(value) {
  return escapeGoIdentifier(pascalCase(value));
}
__name(toGoEnumMemberName, "toGoEnumMemberName");
function escapeGoIdentifier(value) {
  return isGoKeyword(value) ? `${value}_` : value;
}
__name(escapeGoIdentifier, "escapeGoIdentifier");

// src/go/render-go-expr.ts
function exprUsesSlices(expr) {
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
__name(exprUsesSlices, "exprUsesSlices");
function renderGoExpr(expr, ctx) {
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
      return `!(${renderGoExpr(expr.value, ctx)})`;
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
__name(renderGoExpr, "renderGoExpr");
function renderComparison(left, operator, right, ctx) {
  const leftType = exprValueType(left);
  if (leftType === "datetime") {
    return renderDatetimeComparison(left, operator, right, ctx);
  }
  if (leftType.startsWith("enum:")) {
    return renderEnumComparison(left, operator, right, ctx);
  }
  const leftGo = renderOperandValue(left, ctx);
  const rightGo = renderOperandValue(right, ctx);
  const guard = nullSafeGuard(left, right, ctx);
  const direct = `${leftGo} ${operator} ${rightGo}`;
  if (guard === void 0) {
    return `(${direct})`;
  }
  if (operator === "==") {
    return `(${guard} && ${direct})`;
  }
  return `(!(${guard}) || ${direct})`;
}
__name(renderComparison, "renderComparison");
function exprValueType(expr) {
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
__name(exprValueType, "exprValueType");
function renderOperandValue(expr, ctx) {
  if (expr.kind === "ref") {
    return renderRefValue(expr, ctx);
  }
  if (expr.kind === "literal") {
    return renderLiteral(expr);
  }
  return renderGoExpr(expr, ctx);
}
__name(renderOperandValue, "renderOperandValue");
function nullSafeGuard(left, right, _ctx) {
  const guards = [];
  if (left.kind === "ref" && left.optional) {
    guards.push(presenceCondition(left));
  }
  if (right.kind === "ref" && right.optional) {
    guards.push(presenceCondition(right));
  }
  if (guards.length === 0) {
    return void 0;
  }
  if (guards.length === 1) {
    return guards[0];
  }
  return `(${guards.join(" && ")})`;
}
__name(nullSafeGuard, "nullSafeGuard");
function renderDatetimeComparison(left, operator, right, ctx) {
  const leftGo = renderOperandValue(left, ctx);
  const rightGo = renderOperandValue(right, ctx);
  const guard = nullSafeGuard(left, right, ctx);
  let call;
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
      call = `(${leftGo}.After(${rightGo}) || ${leftGo}.Equal(${rightGo}))`;
      break;
    case "<":
      call = `${leftGo}.Before(${rightGo})`;
      break;
    case "<=":
      call = `(${leftGo}.Before(${rightGo}) || ${leftGo}.Equal(${rightGo}))`;
      break;
  }
  if (guard === void 0) {
    return `(${call})`;
  }
  if (operator === "!=") {
    return `(!(${guard}) || ${call})`;
  }
  return `(${guard} && ${call})`;
}
__name(renderDatetimeComparison, "renderDatetimeComparison");
function renderEnumComparison(left, operator, right, ctx) {
  var _a4;
  const enumName = (_a4 = enumNameOf(left)) != null ? _a4 : enumNameOf(right);
  if (enumName === void 0) {
    fail2("Cannot resolve enum type for enum comparison.");
  }
  const leftGo = renderEnumOperand(left, enumName, ctx);
  const rightGo = renderEnumOperand(right, enumName, ctx);
  const guard = nullSafeGuard(left, right, ctx);
  const direct = `${leftGo} ${operator} ${rightGo}`;
  if (guard === void 0) {
    return `(${direct})`;
  }
  if (operator === "==") {
    return `(${guard} && ${direct})`;
  }
  if (operator === "!=") {
    return `(!(${guard}) || ${direct})`;
  }
  return `(${guard} && ${direct})`;
}
__name(renderEnumComparison, "renderEnumComparison");
function enumNameOf(expr) {
  if (expr.kind === "ref" && expr.valueType.kind === "enum") {
    return expr.valueType.enumName;
  }
  return void 0;
}
__name(enumNameOf, "enumNameOf");
function renderEnumOperand(expr, enumName, ctx) {
  if (expr.kind === "literal") {
    return renderEnumConstant(enumName, expr.value, ctx);
  }
  return renderOperandValue(expr, ctx);
}
__name(renderEnumOperand, "renderEnumOperand");
function renderIn(value, candidates, ctx) {
  if (candidates.kind === "array") {
    if (candidates.items.length === 0) {
      return "(false)";
    }
    const valueEnum = enumNameOf(value);
    const parts = candidates.items.map((item) => {
      if (valueEnum !== void 0 && item.kind === "literal") {
        const leftGo2 = renderOperandValue(value, ctx);
        const rightGo2 = renderEnumConstant(valueEnum, item.value, ctx);
        const guard3 = nullSafeGuard(value, item, ctx);
        const direct2 = `${leftGo2} == ${rightGo2}`;
        if (guard3 === void 0) {
          return `(${direct2})`;
        }
        return `(${guard3} && ${direct2})`;
      }
      if (item.kind === "ref" && item.valueType.kind === "enum") {
        const leftGo2 = renderOperandValue(value, ctx);
        const rightGo2 = renderOperandValue(item, ctx);
        const guard3 = nullSafeGuard(value, item, ctx);
        const direct2 = `${leftGo2} == ${rightGo2}`;
        if (guard3 === void 0) {
          return `(${direct2})`;
        }
        return `(${guard3} && ${direct2})`;
      }
      const leftGo = renderOperandValue(value, ctx);
      const rightGo = renderOperandValue(item, ctx);
      const guard2 = nullSafeGuard(value, item, ctx);
      const direct = `${leftGo} == ${rightGo}`;
      if (guard2 === void 0) {
        return `(${direct})`;
      }
      return `(${guard2} && ${direct})`;
    });
    if (parts.length === 1) {
      return parts[0];
    }
    return `(${parts.join(" || ")})`;
  }
  const valueGo = renderOperandValue(value, ctx);
  const candidatesGo = renderRefValue(candidates, ctx);
  const guard = nullSafeGuard(value, candidates, ctx);
  const call = `slices.Contains(${candidatesGo}, ${valueGo})`;
  if (guard === void 0) {
    return `(${call})`;
  }
  return `(${guard} && ${call})`;
}
__name(renderIn, "renderIn");
function renderHas(ref) {
  const checks = [];
  const prefix = [ref.root];
  for (let index = 0; index < ref.segments.length; index += 1) {
    const segment = ref.segments[index];
    if (segment === void 0) {
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
__name(renderHas, "renderHas");
function presenceCondition(ref) {
  const inner = renderHas(ref);
  if (inner === "(true)") {
    return "(true)";
  }
  return inner;
}
__name(presenceCondition, "presenceCondition");
function renderRefValue(ref, _ctx) {
  const path = [
    ref.root,
    ...ref.segments.map((item) => toGoFieldName(item.name))
  ].join(".");
  if (!ref.optional) {
    return path;
  }
  const last = ref.segments[ref.segments.length - 1];
  if (last === void 0 || !last.optional) {
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
__name(renderRefValue, "renderRefValue");
function renderLiteral(expr) {
  if (typeof expr.value === "string") {
    return JSON.stringify(expr.value);
  }
  if (typeof expr.value === "boolean") {
    return expr.value ? "true" : "false";
  }
  return String(expr.value);
}
__name(renderLiteral, "renderLiteral");
function renderArrayLiteral(expr, ctx) {
  if (expr.items.length === 0) {
    return "nil";
  }
  const items = expr.items.map((item) => {
    if (item.kind === "literal") {
      if (expr.valueType.element !== void 0 && typeof expr.valueType.element === "object" && item.valueType.kind !== "enum") {
        const element = expr.valueType.element;
        return renderEnumConstant(element.enumName, item.value, ctx);
      }
      return renderLiteral(item);
    }
    return renderGoExpr(item, ctx);
  });
  return `[]any{${items.join(", ")}}`;
}
__name(renderArrayLiteral, "renderArrayLiteral");
function renderEnumConstant(enumName, literal, ctx) {
  const member = findEnumMember(ctx.schema, enumName, literal);
  if (member === void 0) {
    fail2(
      `Cannot resolve enum value ${JSON.stringify(literal)} for enum ${JSON.stringify(enumName)}.`
    );
  }
  return `${ctx.typesPrefix}${toGoTypeName(enumName)}${toGoEnumMemberName(member)}`;
}
__name(renderEnumConstant, "renderEnumConstant");
function findEnumMember(schema, enumName, literal) {
  const enumDef = schema.enums.find((item) => item.name === enumName);
  if (enumDef === void 0) {
    return void 0;
  }
  for (const member of enumDef.members) {
    if (typeof literal === "string" && member.name === literal) {
      return member.name;
    }
    const value = member.value;
    if (typeof literal === "string" && value.kind === "string" && value.stringValue === literal) {
      return member.name;
    }
    if (typeof literal === "number" && value.kind === "int" && value.intValue === literal) {
      return member.name;
    }
  }
  return void 0;
}
__name(findEnumMember, "findEnumMember");

// src/go/render-go-file.ts
function renderGoFile(schema, policies, options) {
  const typesPrefix = options.typesImport.length > 0 ? "vdltypes." : "";
  const ctx = { schema, typesPrefix };
  const lines = [
    "// Generated by VDL. Do not edit.",
    `package ${options.packageName}`,
    ""
  ];
  const needsSlices = policies.some(
    (policy) => exprUsesSlices(policy.allow) || policy.deny !== void 0 && exprUsesSlices(policy.deny)
  );
  const needsTypesImport = options.typesImport.length > 0 && policies.length > 0;
  if (needsSlices || needsTypesImport) {
    lines.push("import (");
    if (needsSlices) {
      lines.push('	"slices"');
    }
    if (needsTypesImport) {
      lines.push(`	vdltypes ${JSON.stringify(options.typesImport)}`);
    }
    lines.push(")", "");
  }
  for (const [index, policy] of policies.entries()) {
    lines.push(...renderPolicyFunc(policy, typesPrefix, ctx.schema));
    if (index < policies.length - 1) {
      lines.push("");
    }
  }
  if (policies.length > 0) {
    lines.push("");
    lines.push(...renderCatalog(policies, typesPrefix, ctx.schema));
  }
  return `${lines.join("\n")}
`;
}
__name(renderGoFile, "renderGoFile");
function renderPolicyFunc(policy, typesPrefix, schema) {
  const params = renderParams(policy, typesPrefix);
  const ctx = { schema, typesPrefix };
  const allowGo = renderGoExpr(policy.allow, ctx);
  const lines = [];
  lines.push(...renderDocLines(policy));
  lines.push(`func ${policy.goName}(${params}) bool {`);
  if (policy.deny !== void 0) {
    const denyGo = renderGoExpr(policy.deny, ctx);
    lines.push(`	if ${denyGo} {`);
    lines.push("		return false");
    lines.push("	}");
  }
  lines.push(`	return ${allowGo}`);
  lines.push("}");
  return lines;
}
__name(renderPolicyFunc, "renderPolicyFunc");
function renderParams(policy, typesPrefix) {
  const parts = [`principal ${typesPrefix}${policy.principalGoName}`];
  if (policy.resourceType !== void 0 && policy.resourceGoName !== void 0) {
    parts.push(`resource ${typesPrefix}${policy.resourceGoName}`);
  }
  if (policy.contextType !== void 0 && policy.contextGoName !== void 0) {
    parts.push(`context ${typesPrefix}${policy.contextGoName}`);
  }
  return parts.join(", ");
}
__name(renderParams, "renderParams");
function renderDocLines(policy) {
  var _a4, _b, _c;
  const lines = [];
  if (policy.doc !== void 0 && policy.doc.trim().length > 0) {
    const first = (_b = (_a4 = policy.doc.split("\n")[0]) == null ? void 0 : _a4.trim()) != null ? _b : "";
    lines.push(`// ${policy.goName} checks the ${policy.name} policy.`);
    if (first.length > 0) {
      lines.push(`// ${first}`);
    }
  } else {
    lines.push(`// ${policy.goName} checks the ${policy.name} policy.`);
  }
  if (policy.isDeprecated) {
    const message = (_c = policy.deprecationMessage) != null ? _c : "This policy is deprecated.";
    lines.push("//", `// Deprecated: ${message}`);
  }
  return lines;
}
__name(renderDocLines, "renderDocLines");
function renderCatalog(policies, typesPrefix, _schema) {
  const lines = [
    "// VDLPolicyCatalog catalogs all @policy-annotated types with their check functions.",
    "type VDLPolicyCatalog struct {"
  ];
  for (const policy of policies) {
    const params = renderCheckSignature(policy, typesPrefix);
    lines.push(
      `	// ${policy.goName} is the metadata for the ${policy.name} policy.`
    );
    lines.push(`	${policy.goName} struct {`);
    lines.push("		// Name is the name of this policy.");
    lines.push("		Name string");
    lines.push("		// Check evaluates this policy.");
    lines.push(`		Check func(${params}) bool`);
    lines.push("	}");
  }
  lines.push(
    "}",
    "",
    "// VDLPolicies indexes generated policies by type name.",
    "var VDLPolicies = VDLPolicyCatalog{"
  );
  for (const policy of policies) {
    const params = renderCheckSignature(policy, typesPrefix);
    lines.push(
      `	// ${policy.goName} is the metadata for the ${policy.name} policy.`
    );
    lines.push(`	${policy.goName}: struct {`);
    lines.push("		// Name is the name of this policy.");
    lines.push("		Name string");
    lines.push("		// Check evaluates this policy.");
    lines.push(`		Check func(${params}) bool`);
    lines.push("	}{");
    lines.push(`		Name: ${JSON.stringify(policy.name)},`);
    lines.push(`		Check: ${policy.goName},`);
    lines.push("	},");
  }
  lines.push(
    "}",
    "",
    "// Names returns every policy name in sorted order.",
    "func (c VDLPolicyCatalog) Names() []string {"
  );
  if (policies.length === 0) {
    lines.push("	return nil");
  } else {
    const names = policies.map((policy) => JSON.stringify(policy.name)).join(", ");
    lines.push(`	return []string{${names}}`);
  }
  lines.push("}");
  return lines;
}
__name(renderCatalog, "renderCatalog");
function renderCheckSignature(policy, typesPrefix) {
  const parts = [`${typesPrefix}${policy.principalGoName}`];
  if (policy.resourceType !== void 0 && policy.resourceGoName !== void 0) {
    parts.push(`${typesPrefix}${policy.resourceGoName}`);
  }
  if (policy.contextType !== void 0 && policy.contextGoName !== void 0) {
    parts.push(`${typesPrefix}${policy.contextGoName}`);
  }
  return parts.join(", ");
}
__name(renderCheckSignature, "renderCheckSignature");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/options/get-option-string.js
function getOptionString(options, key, defaultValue) {
  const value = options === null || options === void 0 ? void 0 : options[key];
  return value === void 0 ? defaultValue : value;
}
__name(getOptionString, "getOptionString");

// src/options/resolve.ts
var defaultPackageName = "policy";
var defaultOutFile = "policies.go";
function resolveGeneratorOptions(input) {
  const packageName = getOptionString(
    input.options,
    "package",
    defaultPackageName
  ).trim();
  const outFile = getOptionString(
    input.options,
    "outFile",
    defaultOutFile
  ).trim();
  const typesImport = getOptionString(input.options, "typesImport", "").trim();
  const errors = [];
  if (packageName.length === 0) {
    errors.push({ message: 'Option "package" cannot be empty when provided.' });
  } else if (!isValidGoPackageName(packageName)) {
    errors.push({
      message: `Invalid Go package name ${JSON.stringify(packageName)}. Use a lowercase Go identifier.`
    });
  }
  const finalOutFile = outFile.length === 0 ? defaultOutFile : outFile;
  if (!finalOutFile.endsWith(".go")) {
    errors.push({
      message: `Invalid outFile ${JSON.stringify(finalOutFile)}. The output file must end with .go.`
    });
  }
  if (errors.length > 0) {
    return { errors };
  }
  return {
    errors: [],
    options: {
      packageName,
      outFile: finalOutFile,
      typesImport
    }
  };
}
__name(resolveGeneratorOptions, "resolveGeneratorOptions");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/ir/get-annotation.js
function getAnnotation(annotations, name) {
  if (!annotations) return void 0;
  return annotations.find((anno) => anno.name === name);
}
__name(getAnnotation, "getAnnotation");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/ir/get-annotation-arg.js
function getAnnotationArg(annotations, name) {
  const anno = getAnnotation(annotations, name);
  return anno === null || anno === void 0 ? void 0 : anno.argument;
}
__name(getAnnotationArg, "getAnnotationArg");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/deprecations/get-deprecation-message.js
function getDeprecationMessage(annotations) {
  const argument = getAnnotationArg(annotations, "deprecated");
  if ((argument === null || argument === void 0 ? void 0 : argument.kind) !== "string") return;
  return argument.stringValue;
}
__name(getDeprecationMessage, "getDeprecationMessage");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/deprecations/is-deprecated.js
function isDeprecated(annotations) {
  return getAnnotation(annotations, "deprecated") !== void 0;
}
__name(isDeprecated, "isDeprecated");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/ir/unwrap-literal.js
function unwrapLiteral(value) {
  return unwrapLiteralValue(value);
}
__name(unwrapLiteral, "unwrapLiteral");
function unwrapLiteralValue(value) {
  switch (value.kind) {
    case "string":
      return value.stringValue;
    case "int":
      return value.intValue;
    case "float":
      return value.floatValue;
    case "bool":
      return value.boolValue;
    case "object": {
      var _value$objectEntries;
      const resolvedObject = {};
      const entries = (_value$objectEntries = value.objectEntries) !== null && _value$objectEntries !== void 0 ? _value$objectEntries : [];
      for (const entry of entries) resolvedObject[entry.key] = unwrapLiteralValue(entry.value);
      return resolvedObject;
    }
    case "array":
      var _value$arrayItems;
      return ((_value$arrayItems = value.arrayItems) !== null && _value$arrayItems !== void 0 ? _value$arrayItems : []).map((item) => unwrapLiteralValue(item));
    default:
      return null;
  }
}
__name(unwrapLiteralValue, "unwrapLiteralValue");

// node_modules/@varavel/vdl-plugin-sdk/dist/_virtual/_@oxc-project_runtime@0.154.0/helpers/esm/typeof.js
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}
__name(_typeof, "_typeof");

// node_modules/@varavel/vdl-plugin-sdk/dist/_virtual/_@oxc-project_runtime@0.154.0/helpers/esm/toPrimitive.js
function toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
__name(toPrimitive, "toPrimitive");

// node_modules/@varavel/vdl-plugin-sdk/dist/_virtual/_@oxc-project_runtime@0.154.0/helpers/esm/toPropertyKey.js
function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}
__name(toPropertyKey, "toPropertyKey");

// node_modules/@varavel/vdl-plugin-sdk/dist/_virtual/_@oxc-project_runtime@0.154.0/helpers/esm/defineProperty.js
function _defineProperty(e, r, t) {
  return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
__name(_defineProperty, "_defineProperty");

// node_modules/@varavel/vdl-plugin-sdk/dist/_virtual/_@oxc-project_runtime@0.154.0/helpers/esm/objectSpread2.js
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
__name(ownKeys, "ownKeys");
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
__name(_objectSpread2, "_objectSpread2");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/policy/parse-policy-expression.js
function isAlpha(code) {
  return code >= 65 && code <= 90 || code >= 97 && code <= 122 || code === 95;
}
__name(isAlpha, "isAlpha");
function isDigit(code) {
  return code >= 48 && code <= 57;
}
__name(isDigit, "isDigit");
function isAlphaNum(code) {
  return isAlpha(code) || isDigit(code);
}
__name(isAlphaNum, "isAlphaNum");
function isSpace(code) {
  return code === 32 || code === 9 || code === 10 || code === 13;
}
__name(isSpace, "isSpace");
function snippet(source, offset) {
  const from = offset < 20 ? 0 : offset - 20;
  const to = offset + 20 < source.length ? offset + 20 : source.length;
  return JSON.stringify(source.slice(from, to));
}
__name(snippet, "snippet");
function tokenizePolicyExpression(source) {
  const tokens = [];
  let i = 0;
  while (i < source.length) {
    const code = source.charCodeAt(i);
    if (isSpace(code)) {
      i += 1;
      continue;
    }
    if (isAlpha(code)) {
      const start = i;
      i += 1;
      while (i < source.length && isAlphaNum(source.charCodeAt(i))) i += 1;
      tokens.push({
        kind: "ident",
        text: source.slice(start, i),
        start,
        end: i
      });
      continue;
    }
    if (isDigit(code)) {
      const start = i;
      while (i < source.length && isDigit(source.charCodeAt(i))) i += 1;
      let isFloat = false;
      let value;
      if (source.charCodeAt(i) === 46 && i + 1 < source.length && isDigit(source.charCodeAt(i + 1))) {
        isFloat = true;
        i += 1;
        while (i < source.length && isDigit(source.charCodeAt(i))) i += 1;
        value = Number(source.slice(start, i));
      } else value = Number(source.slice(start, i));
      if (!Number.isFinite(value)) throw new Error(`Invalid number at offset ${start} in ${snippet(source, start)}`);
      tokens.push({
        kind: "number",
        value,
        isFloat,
        start,
        end: i
      });
      continue;
    }
    if (code === 39) {
      const start = i;
      i += 1;
      let out = "";
      let closed = false;
      while (i < source.length) {
        const c = source.charCodeAt(i);
        if (c === 92) {
          const next = i + 1 < source.length ? source.charCodeAt(i + 1) : -1;
          if (next === 39) {
            out += "'";
            i += 2;
            continue;
          }
          if (next === 92) {
            out += "\\";
            i += 2;
            continue;
          }
          throw new Error(`Unsupported escape at offset ${i} in ${snippet(source, i)}`);
        }
        if (c === 39) {
          closed = true;
          i += 1;
          break;
        }
        out += source[i];
        i += 1;
      }
      if (!closed) throw new Error(`Unterminated string at offset ${start} in ${snippet(source, start)}`);
      tokens.push({
        kind: "string",
        value: out,
        start,
        end: i
      });
      continue;
    }
    const two = source.slice(i, i + 2);
    if (two === "==" || two === "!=" || two === ">=" || two === "<=" || two === "&&" || two === "||") {
      tokens.push({
        kind: "op",
        text: two,
        start: i,
        end: i + 2
      });
      i += 2;
      continue;
    }
    const ch = source[i];
    if (ch === ">" || ch === "<" || ch === "!") {
      tokens.push({
        kind: "op",
        text: ch,
        start: i,
        end: i + 1
      });
      i += 1;
      continue;
    }
    if (ch === "(") {
      tokens.push({
        kind: "lparen",
        start: i,
        end: i + 1
      });
      i += 1;
      continue;
    }
    if (ch === ")") {
      tokens.push({
        kind: "rparen",
        start: i,
        end: i + 1
      });
      i += 1;
      continue;
    }
    if (ch === "[") {
      tokens.push({
        kind: "lbracket",
        start: i,
        end: i + 1
      });
      i += 1;
      continue;
    }
    if (ch === "]") {
      tokens.push({
        kind: "rbracket",
        start: i,
        end: i + 1
      });
      i += 1;
      continue;
    }
    if (ch === ",") {
      tokens.push({
        kind: "comma",
        start: i,
        end: i + 1
      });
      i += 1;
      continue;
    }
    if (ch === ".") {
      tokens.push({
        kind: "dot",
        start: i,
        end: i + 1
      });
      i += 1;
      continue;
    }
    throw new Error(`Unexpected character ${JSON.stringify(ch)} at offset ${i} in ${snippet(source, i)}`);
  }
  return tokens;
}
__name(tokenizePolicyExpression, "tokenizePolicyExpression");
var _a2;
var Parser = (_a2 = class {
  constructor(tokens, source) {
    this.tokens = tokens;
    this.source = source;
    this.pos = 0;
  }
  parse() {
    if (this.tokens.length === 0) throw new Error(`Empty expression in ${JSON.stringify(this.source)}`);
    const expr = this.parseOr();
    const extra = this.peek();
    if (extra) throw new Error(`Unexpected token at offset ${extra.start} in ${snippet(this.source, extra.start)}`);
    return expr;
  }
  peek() {
    return this.tokens[this.pos];
  }
  next() {
    const token = this.tokens[this.pos];
    this.pos += 1;
    return token;
  }
  parseOr() {
    const first = this.parseAnd();
    const options = [first];
    for (; ; ) {
      const token = this.peek();
      if (token && token.kind === "op" && token.text === "||") {
        this.next();
        options.push(this.parseAnd());
        continue;
      }
      break;
    }
    if (options.length === 1) return options[0];
    return {
      kind: "or",
      options,
      start: first.start,
      end: options[options.length - 1].end
    };
  }
  parseAnd() {
    const first = this.parseCmp();
    const clauses = [first];
    for (; ; ) {
      const token = this.peek();
      if (token && token.kind === "op" && token.text === "&&") {
        this.next();
        clauses.push(this.parseCmp());
        continue;
      }
      break;
    }
    if (clauses.length === 1) return clauses[0];
    return {
      kind: "and",
      clauses,
      start: first.start,
      end: clauses[clauses.length - 1].end
    };
  }
  parseCmp() {
    const left = this.parseUnary();
    const token = this.peek();
    if (!token) return left;
    if (token.kind === "op" && (token.text === "==" || token.text === "!=" || token.text === ">" || token.text === ">=" || token.text === "<" || token.text === "<=")) {
      this.next();
      const right = this.parseUnary();
      return {
        kind: "comparison",
        operator: token.text,
        left,
        right,
        start: left.start,
        end: right.end
      };
    }
    if (token.kind === "ident" && token.text === "in") {
      this.next();
      const right = this.parseUnary();
      return {
        kind: "in",
        value: left,
        candidates: right,
        start: left.start,
        end: right.end
      };
    }
    return left;
  }
  parseUnary() {
    const token = this.peek();
    if (token && token.kind === "op" && token.text === "!") {
      this.next();
      const value = this.parseUnary();
      return {
        kind: "not",
        value,
        start: token.start,
        end: value.end
      };
    }
    return this.parsePrimary();
  }
  parsePrimary() {
    const token = this.peek();
    if (!token) throw new Error(`Unexpected end in ${JSON.stringify(this.source)}`);
    if (token.kind === "lparen") {
      this.next();
      const inner = this.parseOr();
      const closing = this.next();
      if ((closing === null || closing === void 0 ? void 0 : closing.kind) !== "rparen") throw new Error(`Missing closing parenthesis at offset ${token.start} in ${snippet(this.source, token.start)}`);
      return _objectSpread2(_objectSpread2({}, inner), {}, {
        start: token.start,
        end: closing.end
      });
    }
    if (token.kind === "lbracket") return this.parseArray();
    if (token.kind === "string") {
      this.next();
      return {
        kind: "literal",
        value: token.value,
        literalKind: "string",
        start: token.start,
        end: token.end
      };
    }
    if (token.kind === "number") {
      this.next();
      return {
        kind: "literal",
        value: token.value,
        literalKind: token.isFloat ? "float" : "int",
        start: token.start,
        end: token.end
      };
    }
    if (token.kind === "ident") {
      if (token.text === "true" || token.text === "false") {
        this.next();
        return {
          kind: "literal",
          value: token.text === "true",
          literalKind: "bool",
          start: token.start,
          end: token.end
        };
      }
      if (token.text === "has") return this.parseHas();
      if (token.text === "principal" || token.text === "resource" || token.text === "context") return this.parseRef();
      throw new Error(`Unknown identifier ${JSON.stringify(token.text)} at offset ${token.start} in ${snippet(this.source, token.start)}`);
    }
    throw new Error(`Unexpected token at offset ${token.start} in ${snippet(this.source, token.start)}`);
  }
  parseHas() {
    const start = this.next();
    const open = this.next();
    if ((open === null || open === void 0 ? void 0 : open.kind) !== "lparen") throw new Error(`Missing opening parenthesis for has at offset ${start.start} in ${snippet(this.source, start.start)}`);
    const refToken = this.peek();
    if ((refToken === null || refToken === void 0 ? void 0 : refToken.kind) !== "ident") throw new Error(`has() expects a reference at offset ${open.end} in ${snippet(this.source, open.end)}`);
    if (refToken.text !== "principal" && refToken.text !== "resource" && refToken.text !== "context") throw new Error(`has() expects principal, resource or context at offset ${refToken.start} in ${snippet(this.source, refToken.start)}`);
    const ref = this.parseRef();
    const closing = this.next();
    if ((closing === null || closing === void 0 ? void 0 : closing.kind) !== "rparen") throw new Error(`Missing closing parenthesis for has at offset ${start.start} in ${snippet(this.source, start.start)}`);
    return {
      kind: "has",
      ref,
      start: start.start,
      end: closing.end
    };
  }
  parseRef() {
    const root = this.next();
    if (root.kind !== "ident") throw new Error(`Expected root in ${JSON.stringify(this.source)}`);
    const path = [];
    let end = root.end;
    const dot = this.peek();
    if ((dot === null || dot === void 0 ? void 0 : dot.kind) !== "dot") throw new Error(`Reference ${JSON.stringify(root.kind === "ident" ? root.text : "")} needs a field path at offset ${root.start} in ${snippet(this.source, root.start)}`);
    for (; ; ) {
      const separator = this.next();
      if ((separator === null || separator === void 0 ? void 0 : separator.kind) !== "dot") break;
      const field = this.next();
      if ((field === null || field === void 0 ? void 0 : field.kind) !== "ident") throw new Error(`Expected field name at offset ${separator.end} in ${snippet(this.source, separator.end)}`);
      path.push(field.text);
      end = field.end;
      const next = this.peek();
      if ((next === null || next === void 0 ? void 0 : next.kind) !== "dot") break;
    }
    return {
      kind: "ref",
      root: root.text,
      path,
      start: root.start,
      end
    };
  }
  parseArray() {
    const open = this.next();
    const items = [];
    const next = this.peek();
    if (next && next.kind === "rbracket") {
      const closing2 = this.next();
      return {
        kind: "array",
        items,
        start: open.start,
        end: closing2.end
      };
    }
    for (; ; ) {
      const item = this.parseOr();
      items.push(item);
      const separator = this.peek();
      if (separator && separator.kind === "comma") {
        this.next();
        const afterComma = this.peek();
        if (!afterComma) throw new Error(`Trailing comma at offset ${separator.start} in ${snippet(this.source, separator.start)}`);
        if (afterComma.kind === "rbracket") throw new Error(`Trailing comma at offset ${separator.start} in ${snippet(this.source, separator.start)}`);
        continue;
      }
      break;
    }
    const closing = this.next();
    if ((closing === null || closing === void 0 ? void 0 : closing.kind) !== "rbracket") throw new Error(`Missing closing bracket at offset ${open.start} in ${snippet(this.source, open.start)}`);
    return {
      kind: "array",
      items,
      start: open.start,
      end: closing.end
    };
  }
}, __name(_a2, "Parser"), _a2);
function parsePolicyExpressionSyntax(source) {
  return new Parser(tokenizePolicyExpression(source), source).parse();
}
__name(parsePolicyExpressionSyntax, "parsePolicyExpressionSyntax");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/policy/assert-valid-ir-for-policy.js
var POLICY_ANNOTATION_NAME = "policy";
var SUPPORTED_VERSION = 1;
function assertValidIrForPolicy(ir) {
  rejectPolicyOutsideTypes(ir);
  const typesByName = /* @__PURE__ */ new Map();
  for (const typeDef of ir.types) typesByName.set(typeDef.name, typeDef);
  const enumsByName = /* @__PURE__ */ new Map();
  for (const enumDef of ir.enums) enumsByName.set(enumDef.name, enumDef);
  const policies = [];
  for (const typeDef of ir.types) {
    const annotation = typeDef.annotations.find((item) => item.name === POLICY_ANNOTATION_NAME);
    if (!annotation) continue;
    policies.push(validatePolicyType(typeDef, annotation.position, annotation.argument, typesByName, enumsByName));
  }
  policies.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  return policies;
}
__name(assertValidIrForPolicy, "assertValidIrForPolicy");
function rejectPolicyOutsideTypes(ir) {
  for (const enumDef of ir.enums) {
    const annotation = enumDef.annotations.find((item) => item.name === POLICY_ANNOTATION_NAME);
    if (annotation) fail(`Annotation @policy is only allowed on type declarations, found on enum ${JSON.stringify(enumDef.name)}.`, annotation.position);
  }
  for (const constant of ir.constants) {
    const annotation = constant.annotations.find((item) => item.name === POLICY_ANNOTATION_NAME);
    if (annotation) fail(`Annotation @policy is only allowed on type declarations, found on constant ${JSON.stringify(constant.name)}.`, annotation.position);
  }
}
__name(rejectPolicyOutsideTypes, "rejectPolicyOutsideTypes");
function validatePolicyType(typeDef, annotationPosition, argument, typesByName, enumsByName) {
  var _objectEntries, _typeDef$typeRef$obje, _fields$;
  if (argument === void 0 || argument.kind !== "object") fail(`Type ${JSON.stringify(typeDef.name)} annotation @policy must have an object argument with allow, deny and version.`, annotationPosition);
  const raw = unwrapLiteral(argument);
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) fail(`Type ${JSON.stringify(typeDef.name)} annotation @policy must have an object argument with allow, deny and version.`, annotationPosition);
  const allowedKeys = /* @__PURE__ */ new Set([
    "allow",
    "deny",
    "version"
  ]);
  for (const key of Object.keys(raw)) if (!allowedKeys.has(key)) fail(`Type ${JSON.stringify(typeDef.name)} annotation @policy has unknown key ${JSON.stringify(key)}.`, annotationPosition);
  const record = raw;
  const allowRaw = record.allow;
  if (typeof allowRaw !== "string" || allowRaw.trim().length === 0) fail(`Type ${JSON.stringify(typeDef.name)} annotation @policy requires a non-empty string allow expression.`, annotationPosition);
  const denyRaw = record.deny;
  if (denyRaw !== void 0 && (typeof denyRaw !== "string" || denyRaw.trim().length === 0)) fail(`Type ${JSON.stringify(typeDef.name)} annotation @policy deny must be a non-empty string when present.`, annotationPosition);
  const versionEntry = new Map(((_objectEntries = argument.objectEntries) !== null && _objectEntries !== void 0 ? _objectEntries : []).map((entry) => [entry.key, entry.value])).get("version");
  if (versionEntry !== void 0 && versionEntry.kind !== "int") fail(`Type ${JSON.stringify(typeDef.name)} annotation @policy version must be an int.`, annotationPosition);
  const versionRaw = record.version;
  const version = versionRaw === void 0 ? SUPPORTED_VERSION : versionRaw;
  if (typeof version !== "number" || !Number.isInteger(version) || version !== SUPPORTED_VERSION) fail(`Type ${JSON.stringify(typeDef.name)} annotation @policy has unsupported version ${JSON.stringify(version)}.`, annotationPosition);
  if (typeDef.typeRef.kind !== "object") fail(`Type ${JSON.stringify(typeDef.name)} is annotated with @policy and must be an object type.`, typeDef.position);
  const fields = (_typeDef$typeRef$obje = typeDef.typeRef.objectFields) !== null && _typeDef$typeRef$obje !== void 0 ? _typeDef$typeRef$obje : [];
  if (fields.length === 0 || ((_fields$ = fields[0]) === null || _fields$ === void 0 ? void 0 : _fields$.name) !== "principal") fail(`Type ${JSON.stringify(typeDef.name)} is annotated with @policy and must declare principal as first field.`, typeDef.position);
  const names = fields.map((field) => field.name);
  const seen = /* @__PURE__ */ new Set();
  for (const name of names) {
    if (name !== "principal" && name !== "resource" && name !== "context") fail(`Type ${JSON.stringify(typeDef.name)} is annotated with @policy and must only declare principal, resource and context fields, found ${JSON.stringify(name)}.`, typeDef.position);
    if (seen.has(name)) fail(`Type ${JSON.stringify(typeDef.name)} is annotated with @policy and has duplicate field ${JSON.stringify(name)}.`, typeDef.position);
    seen.add(name);
  }
  const order = [
    "principal",
    "resource",
    "context"
  ];
  let lastIndex = -1;
  for (const name of names) {
    const index = order.indexOf(name);
    if (index < lastIndex) fail(`Type ${JSON.stringify(typeDef.name)} is annotated with @policy and must declare fields in principal, resource, context order.`, typeDef.position);
    lastIndex = index;
  }
  const roots = /* @__PURE__ */ new Map();
  for (const field of fields) {
    if (field.optional) fail(`Field ${JSON.stringify(`${typeDef.name}.${field.name}`)} in policy ${JSON.stringify(typeDef.name)} must be required.`, field.position);
    const target = resolveNamedObjectType(field.typeRef, typesByName);
    if (!target) fail(`Field ${JSON.stringify(`${typeDef.name}.${field.name}`)} in policy ${JSON.stringify(typeDef.name)} must reference a named object type.`, field.position);
    roots.set(field.name, target);
  }
  if (!roots.has("principal")) fail(`Type ${JSON.stringify(typeDef.name)} is annotated with @policy and must declare principal.`, typeDef.position);
  const context = new PolicyContext(typeDef, annotationPosition, roots, typesByName, enumsByName);
  const allow = context.resolveTopLevel(allowRaw, "allow");
  let deny;
  if (typeof denyRaw === "string") deny = context.resolveTopLevel(denyRaw, "deny");
  const validated = {
    name: typeDef.name,
    position: typeDef.position,
    version: SUPPORTED_VERSION,
    principalType: roots.get("principal"),
    allow
  };
  const resourceType = roots.get("resource");
  if (resourceType) validated.resourceType = resourceType;
  const contextType = roots.get("context");
  if (contextType) validated.contextType = contextType;
  if (deny) validated.deny = deny;
  return validated;
}
__name(validatePolicyType, "validatePolicyType");
function resolveNamedObjectType(typeRef, typesByName) {
  if (typeRef.kind !== "type" || !typeRef.typeName) return;
  const target = typesByName.get(typeRef.typeName);
  if ((target === null || target === void 0 ? void 0 : target.typeRef.kind) !== "object") return;
  return target.name;
}
__name(resolveNamedObjectType, "resolveNamedObjectType");
var _a3;
var PolicyContext = (_a3 = class {
  constructor(policyType, annotationPosition, roots, typesByName, enumsByName) {
    this.policyType = policyType;
    this.annotationPosition = annotationPosition;
    this.roots = roots;
    this.typesByName = typesByName;
    this.enumsByName = enumsByName;
  }
  resolveTopLevel(source, which) {
    let syntax;
    try {
      syntax = parsePolicyExpressionSyntax(source);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} expression is invalid: ${message}`, this.annotationPosition);
    }
    const resolved = this.resolveExpr(syntax, /* @__PURE__ */ new Set(), which);
    if (!this.isBoolType(this.exprType(resolved))) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} expression must evaluate to bool.`, this.annotationPosition);
    return resolved;
  }
  exprType(expr) {
    if (expr.kind === "or" || expr.kind === "and" || expr.kind === "not" || expr.kind === "comparison" || expr.kind === "in" || expr.kind === "has") return { kind: "bool-marker" };
    if (expr.kind === "ref" || expr.kind === "literal" || expr.kind === "array") return expr.valueType;
    return { kind: "bool-marker" };
  }
  isBoolType(type) {
    if (type.kind === "bool-marker") return true;
    return type.kind === "bool";
  }
  resolveExpr(syntax, guards, which) {
    switch (syntax.kind) {
      case "or": {
        const options = syntax.options.map((item) => this.resolveExpr(item, new Set(guards), which));
        for (const option of options) this.requireBool(option, which);
        return {
          kind: "or",
          options
        };
      }
      case "and": {
        const clauses = [];
        const running = new Set(guards);
        for (const item of syntax.clauses) {
          const resolved = this.resolveExpr(item, new Set(running), which);
          this.requireBool(resolved, which);
          clauses.push(resolved);
          for (const provided of this.providedGuards(resolved)) running.add(provided);
        }
        return {
          kind: "and",
          clauses
        };
      }
      case "not": {
        const value = this.resolveExpr(syntax.value, new Set(guards), which);
        this.requireBool(value, which);
        return {
          kind: "not",
          value
        };
      }
      case "comparison": {
        const left = this.resolveExpr(syntax.left, new Set(guards), which);
        const right = this.resolveExpr(syntax.right, new Set(guards), which);
        this.requireScalar(left, which);
        this.requireScalar(right, which);
        this.requireCompatible(syntax.operator === "==" || syntax.operator === "!=" ? "equality" : "ordering", left, right, which);
        if (syntax.operator !== "==" && syntax.operator !== "!=") this.requireGuarded(left, right, guards, which);
        return {
          kind: "comparison",
          operator: syntax.operator,
          left,
          right
        };
      }
      case "in": {
        const value = this.resolveExpr(syntax.value, new Set(guards), which);
        const candidates = this.resolveExpr(syntax.candidates, new Set(guards), which);
        this.requireScalar(value, which);
        this.requireArray(candidates, which);
        this.requireInCompatible(value, candidates, which);
        this.requireInGuarded(value, candidates, guards, which);
        return {
          kind: "in",
          value,
          candidates
        };
      }
      case "has":
        return {
          kind: "has",
          ref: this.resolveRef(syntax.ref.root, syntax.ref.path, which)
        };
      case "ref":
        return this.resolveRef(syntax.root, syntax.path, which);
      case "literal":
        return this.resolveLiteral(syntax.value, syntax.literalKind);
      case "array":
        return this.resolveArray(syntax.items, guards, which);
    }
  }
  requireBool(expr, which) {
    const type = this.exprType(expr);
    if (!this.isBoolType(type)) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} expression expects bool operands.`, this.annotationPosition);
  }
  requireScalar(expr, which) {
    if (expr.kind !== "ref" && expr.kind !== "literal") fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} expression expects scalar operands.`, this.annotationPosition);
    const type = expr.valueType;
    if (type.kind === "object" || type.kind === "array") fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} expression compares objects or arrays directly, compare fields instead.`, this.annotationPosition);
  }
  requireArray(expr, which) {
    if (expr.kind !== "array" && !(expr.kind === "ref" && expr.valueType.kind === "array")) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} in expects an array on the right side.`, this.annotationPosition);
  }
  scalarKey(type) {
    if (type.kind === "enum") return `enum:${type.enumName}`;
    return type.kind;
  }
  requireCompatible(mode, left, right, which) {
    const leftType = left.valueType;
    const rightType = right.valueType;
    if (mode === "ordering") {
      const allowed = /* @__PURE__ */ new Set([
        "string",
        "int",
        "float",
        "datetime"
      ]);
      if (!allowed.has(leftType.kind) || !allowed.has(rightType.kind)) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} ordering requires string, int, float or datetime operands.`, this.annotationPosition);
      if (leftType.kind !== rightType.kind) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} ordering needs matching types without conversion.`, this.annotationPosition);
      return;
    }
    if (leftType.kind === "enum" || rightType.kind === "enum") {
      this.requireEnumCompatible(left, right, which);
      return;
    }
    if (leftType.kind !== rightType.kind) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} equality needs matching types without conversion.`, this.annotationPosition);
    if (!(/* @__PURE__ */ new Set([
      "string",
      "int",
      "float",
      "bool",
      "datetime"
    ])).has(leftType.kind)) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} equality supports string, int, float, bool, datetime and enum only.`, this.annotationPosition);
  }
  requireEnumCompatible(left, right, which) {
    const leftType = left.valueType;
    const rightType = right.valueType;
    if (leftType.kind === "enum" && rightType.kind === "enum") {
      const leftEnum = leftType.enumName;
      const rightEnum = rightType.enumName;
      if (leftEnum !== rightEnum) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} compares different enums ${JSON.stringify(leftEnum)} and ${JSON.stringify(rightEnum)}.`, this.annotationPosition);
      return;
    }
    const enumSide = leftType.kind === "enum" ? left : right;
    const otherSide = leftType.kind === "enum" ? right : left;
    const enumName = enumSide.valueType;
    const otherType = otherSide.valueType;
    if (otherSide.kind !== "literal" || otherType.kind !== "string" && otherType.kind !== "int") fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} compares enum ${enumName.enumName} with a string or int literal only.`, this.annotationPosition);
    const literalValue = otherSide.value;
    if (!this.enumHasValue(enumName.enumName, literalValue)) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} uses unknown enum value ${JSON.stringify(literalValue)} for enum ${JSON.stringify(enumName.enumName)}.`, this.annotationPosition);
  }
  requireInCompatible(value, candidates, which) {
    const leftType = value.valueType;
    let elementKind;
    let enumName;
    if (candidates.kind === "array") {
      const element = candidates.valueType.element;
      if (typeof element === "string") elementKind = element;
      else if (typeof element === "object" && element !== null && "enumName" in element) {
        elementKind = `enum:${element.enumName}`;
        enumName = element.enumName;
      } else elementKind = element.kind;
      if (candidates.items.length === 0) return;
    } else {
      const element = candidates.valueType.element;
      if (typeof element === "string") elementKind = element;
      else {
        elementKind = `enum:${element.enumName}`;
        enumName = element.enumName;
      }
    }
    const leftKind = leftType.kind === "enum" ? `enum:${leftType.enumName}` : leftType.kind;
    if (leftKind !== elementKind) {
      if (!(leftType.kind === "enum" && (elementKind === "string" || elementKind === "int"))) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} in needs compatible element types.`, this.annotationPosition);
    }
    if (leftType.kind === "enum" && enumName && leftKind !== elementKind) {
    }
    if (candidates.kind === "array") for (const item of candidates.items) {
      if (item.kind !== "literal" && item.kind !== "ref") fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} array holds scalars only.`, this.annotationPosition);
      const itemType = item.valueType;
      if (itemType.kind === "object" || itemType.kind === "array") fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} array holds scalars only.`, this.annotationPosition);
      if (leftType.kind === "enum" && item.kind === "literal" && (itemType.kind === "string" || itemType.kind === "int")) {
        const literalValue = item.value;
        if (!this.enumHasValue(leftType.enumName, literalValue)) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} uses unknown enum value ${JSON.stringify(literalValue)}.`, this.annotationPosition);
        continue;
      }
      if (this.scalarKey(itemType) !== this.scalarKey(leftType) && !(leftType.kind === "enum" && itemType.kind === "string")) {
        if (leftType.kind !== "enum" || itemType.kind !== "enum") fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} in needs homogeneous element types.`, this.annotationPosition);
      }
    }
  }
  requireGuarded(left, right, guards, which) {
    for (const side of [left, right]) if (side.kind === "ref" && side.optional && !this.isGuarded(side, guards)) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} needs has() guard for optional access ${JSON.stringify(this.refLabel(side))}.`, this.annotationPosition);
  }
  requireInGuarded(value, candidates, guards, which) {
    const refs = [];
    if (value.kind === "ref") refs.push(value);
    if (candidates.kind === "ref") refs.push(candidates);
    if (candidates.kind === "array") {
      for (const item of candidates.items) if (item.kind === "ref") refs.push(item);
    }
    for (const ref of refs) if (ref.optional && !this.isGuarded(ref, guards)) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} needs has() guard for optional access ${JSON.stringify(this.refLabel(ref))}.`, this.annotationPosition);
  }
  providedGuards(expr) {
    if (expr.kind === "has") return [this.refKey(expr.ref)];
    if (expr.kind === "and") {
      const out = [];
      for (const clause of expr.clauses) out.push(...this.providedGuards(clause));
      return out;
    }
    return [];
  }
  refKey(ref) {
    return `${ref.root}.${ref.path.join(".")}`;
  }
  refLabel(ref) {
    return `${ref.root}.${ref.path.join(".")}`;
  }
  isGuarded(ref, guards) {
    if (!ref.optional) return true;
    for (let i = 0; i < ref.segments.length; i += 1) {
      if (!ref.segments[i].optional) continue;
      let covered = false;
      for (const guard of guards) {
        const dot = guard.indexOf(".");
        const guardRoot = guard.slice(0, dot);
        const guardPath = guard.slice(dot + 1).split(".");
        if (guardRoot !== ref.root) continue;
        if (guardPath.length <= i) continue;
        let matches = true;
        for (let j = 0; j <= i; j += 1) if (guardPath[j] !== ref.path[j]) {
          matches = false;
          break;
        }
        if (matches) {
          covered = true;
          break;
        }
      }
      if (!covered) return false;
    }
    return true;
  }
  resolveRef(root, path, which) {
    if (root !== "principal" && root !== "resource" && root !== "context") fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} uses unknown root ${JSON.stringify(root)}.`, this.annotationPosition);
    const rootType = this.roots.get(root);
    if (!rootType) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} uses undeclared root ${JSON.stringify(root)}.`, this.annotationPosition);
    if (path.length === 0) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} reference ${JSON.stringify(root)} needs a field path.`, this.annotationPosition);
    const segments = [];
    const currentTypeName = rootType;
    let currentInlineFields;
    if (currentTypeName) {
      var _typeRef$objectFields;
      const rootDef = this.typesByName.get(currentTypeName);
      if ((rootDef === null || rootDef === void 0 ? void 0 : rootDef.typeRef.kind) !== "object") fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy root ${JSON.stringify(root)} points to unknown object type.`, this.annotationPosition);
      currentInlineFields = (_typeRef$objectFields = rootDef.typeRef.objectFields) === null || _typeRef$objectFields === void 0 ? void 0 : _typeRef$objectFields.map((field) => ({
        name: field.name,
        optional: field.optional,
        typeRef: field.typeRef
      }));
    }
    let optional = false;
    let finalType = { kind: "string" };
    for (let index = 0; index < path.length; index += 1) {
      var _currentInlineFields;
      const name = path[index];
      const field = ((_currentInlineFields = currentInlineFields) !== null && _currentInlineFields !== void 0 ? _currentInlineFields : []).find((item) => item.name === name);
      if (!field) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} uses unknown field ${JSON.stringify(`${root}.${path.slice(0, index + 1).join(".")}`)}.`, this.annotationPosition);
      const valueType = this.resolveValueType(field.typeRef, which);
      const isOptional = field.optional;
      if (isOptional) optional = true;
      segments.push({
        name,
        optional: isOptional,
        valueType
      });
      finalType = valueType;
      if (index < path.length - 1) {
        const next = this.objectFieldsOf(field.typeRef);
        if (!next) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} cannot traverse through non-object field ${JSON.stringify(`${root}.${path.slice(0, index + 1).join(".")}`)}.`, this.annotationPosition);
        currentInlineFields = next;
      }
    }
    return {
      kind: "ref",
      root,
      path: [...path],
      segments,
      valueType: finalType,
      optional
    };
  }
  objectFieldsOf(typeRef) {
    if (typeRef.kind === "object") {
      var _typeRef$objectFields2;
      return ((_typeRef$objectFields2 = typeRef.objectFields) !== null && _typeRef$objectFields2 !== void 0 ? _typeRef$objectFields2 : []).map((field) => ({
        name: field.name,
        optional: field.optional,
        typeRef: field.typeRef
      }));
    }
    if (typeRef.kind === "type" && typeRef.typeName) {
      const target = this.typesByName.get(typeRef.typeName);
      if (target && target.typeRef.kind === "object") {
        var _target$typeRef$objec;
        return ((_target$typeRef$objec = target.typeRef.objectFields) !== null && _target$typeRef$objec !== void 0 ? _target$typeRef$objec : []).map((field) => ({
          name: field.name,
          optional: field.optional,
          typeRef: field.typeRef
        }));
      }
    }
  }
  resolveValueType(typeRef, which) {
    const seen = /* @__PURE__ */ new Set();
    let current = typeRef;
    for (; ; ) {
      if (current.kind === "primitive" && current.primitiveName) return { kind: current.primitiveName };
      if (current.kind === "enum" && current.enumName) return {
        kind: "enum",
        enumName: current.enumName
      };
      if (current.kind === "array" && current.arrayType) {
        if (current.arrayDims !== void 0 && current.arrayDims !== 1) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} arrays hold scalars only.`, this.annotationPosition);
        const element = this.resolveValueType(current.arrayType, which);
        if (element.kind === "object" || element.kind === "array") fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} arrays hold scalars only.`, this.annotationPosition);
        if (element.kind === "enum") return {
          kind: "array",
          element: {
            kind: "enum",
            enumName: element.enumName
          }
        };
        return {
          kind: "array",
          element: element.kind
        };
      }
      if (current.kind === "object") return {
        kind: "object",
        typeName: "inline"
      };
      if (current.kind === "map") return {
        kind: "object",
        typeName: "map"
      };
      if (current.kind === "type" && current.typeName) {
        if (seen.has(current.typeName)) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} has circular type reference.`, this.annotationPosition);
        seen.add(current.typeName);
        const target = this.typesByName.get(current.typeName);
        if (!target) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} points to unknown type ${JSON.stringify(current.typeName)}.`, this.annotationPosition);
        if (target.typeRef.kind === "object") return {
          kind: "object",
          typeName: target.name
        };
        current = target.typeRef;
        continue;
      }
      fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} uses unsupported field type.`, this.annotationPosition);
    }
  }
  resolveLiteral(value, literalKind) {
    if (literalKind === "string") return {
      kind: "literal",
      value,
      valueType: { kind: "string" }
    };
    if (literalKind === "int") return {
      kind: "literal",
      value,
      valueType: { kind: "int" }
    };
    if (literalKind === "float") return {
      kind: "literal",
      value,
      valueType: { kind: "float" }
    };
    return {
      kind: "literal",
      value,
      valueType: { kind: "bool" }
    };
  }
  resolveArray(items, guards, which) {
    const resolved = items.map((item) => this.resolveExpr(item, new Set(guards), which));
    for (const item of resolved) {
      if (item.kind !== "literal" && item.kind !== "ref") fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} array holds scalars only.`, this.annotationPosition);
      const type = item.valueType;
      if (type.kind === "object" || type.kind === "array") fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} array holds scalars only.`, this.annotationPosition);
    }
    if (resolved.length === 0) return {
      kind: "array",
      items: [],
      valueType: {
        kind: "array",
        element: "string"
      }
    };
    const first = resolved[0].valueType;
    let element;
    if (first.kind === "enum") element = {
      kind: "enum",
      enumName: first.enumName
    };
    else element = first.kind;
    for (const item of resolved) {
      const type = item.valueType;
      if ((type.kind === "enum" ? `enum:${type.enumName}` : type.kind) !== (typeof element === "string" ? element : `enum:${element.enumName}`)) fail(`Type ${JSON.stringify(this.policyType.name)} annotation @policy ${which} array needs homogeneous element types.`, this.annotationPosition);
    }
    return {
      kind: "array",
      items: resolved,
      valueType: typeof element === "string" ? {
        kind: "array",
        element
      } : {
        kind: "array",
        element
      }
    };
  }
  enumHasValue(enumName, literal) {
    const enumDef = this.enumsByName.get(enumName);
    if (!enumDef) return false;
    for (const member of enumDef.members) {
      if (typeof literal === "string" && member.name === literal) return true;
      const value = member.value;
      if (typeof literal === "string" && value.kind === "string" && value.stringValue === literal) return true;
      if (typeof literal === "number" && value.kind === "int" && value.intValue === literal) return true;
    }
    return false;
  }
}, __name(_a3, "PolicyContext"), _a3);

// src/policy/collect-policy-models.ts
function collectPolicyModels(ir) {
  const policies = assertValidIrForPolicy(ir);
  const typesByName = new Map(
    ir.types.map((typeDef) => [typeDef.name, typeDef])
  );
  const seenGoNames = /* @__PURE__ */ new Map();
  return policies.map((policy) => {
    const goName = toGoTypeName(policy.name);
    const owner = seenGoNames.get(goName);
    if (owner !== void 0 && owner !== policy.name) {
      fail2(
        `Generated Go function name ${JSON.stringify(goName)} collides for policies ${JSON.stringify(owner)} and ${JSON.stringify(policy.name)}.`,
        policy.position
      );
    }
    seenGoNames.set(goName, policy.name);
    const typeDef = typesByName.get(policy.name);
    const deprecated = isDeprecated(typeDef == null ? void 0 : typeDef.annotations);
    const message = getDeprecationMessage(typeDef == null ? void 0 : typeDef.annotations);
    return __spreadValues(__spreadProps(__spreadValues(__spreadValues(__spreadValues(__spreadProps(__spreadValues({}, policy), {
      goName,
      principalGoName: toGoTypeName(policy.principalType)
    }), policy.resourceType === void 0 ? {} : { resourceGoName: toGoTypeName(policy.resourceType) }), policy.contextType === void 0 ? {} : { contextGoName: toGoTypeName(policy.contextType) }), (typeDef == null ? void 0 : typeDef.doc) === void 0 ? {} : { doc: typeDef.doc }), {
      isDeprecated: deprecated
    }), message === void 0 ? {} : { deprecationMessage: message });
  });
}
__name(collectPolicyModels, "collectPolicyModels");

// src/generate.ts
function generatePluginOutput(input) {
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
          content: renderGoFile(input.ir, policies, optionsResult.options)
        }
      ]
    };
  } catch (error) {
    return { errors: [toPluginOutputError(error)] };
  }
}
__name(generatePluginOutput, "generatePluginOutput");

// src/index.ts
var generate = definePlugin(generatePluginOutput);
