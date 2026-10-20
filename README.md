<p align="center">
  <img
    src="https://cdn.jsdelivr.net/gh/varavelio/vdl@9cb843/assets/png/vdl.png"
    alt="VDL logo"
    width="130"
  />
</p>

<h1 align="center">VDL Go Policy Plugin</h1>

<p align="center">
  Generate Go <strong>policy checks</strong> and a centralized <strong>policy catalog</strong> from VDL <code>@policy</code> types.
</p>

<p align="center">
  <a href="https://varavel.com">
    <img
      src="https://cdn.jsdelivr.net/gh/varavelio/brand@1.0.0/dist/badges/project.svg"
      alt="A Varavel project"
    />
  </a>
  <a href="https://varavel.com/vdl">
    <img
      src="https://cdn.jsdelivr.net/gh/varavelio/brand@1.0.0/dist/badges/vdl-plugin.svg"
      alt="VDL Plugin"
    />
  </a>
</p>

<p align="center">
  Strictly follows <a href="https://vdl.varavel.com/docs/protocols/policy/">VPP-3: Policy</a>.
</p>

This plugin is policy-focused.

It only generates code for types annotated with `@policy`. Unannotated types are ignored.

It does **not** generate Go payload models (types/enums). Payload contracts are delegated to [`varavelio/vdl-plugin-go`](https://github.com/varavelio/vdl-plugin-go).

Use it when you want to:

- generate pure boolean checks for authorization decisions
- keep allow and deny rules synchronized from one VDL source of truth
- call the same decision from RPC handlers, jobs, and UI flows
- expose a small runtime policy catalog for dispatching or introspection

## Quick Start

1. Generate your Go payload types with `varavelio/vdl-plugin-go`.
2. Add this plugin to your `vdl.config.vdl` for policy checks:

```vdl
const config = {
  version 1
  plugins [
    {
      src "varavelio/vdl-plugin-go@<version>" // Use a version from plugin releases
      schema "./schema.vdl"
      outDir "./types"
      options {
        package "types"
      }
    }
    {
      src "varavelio/vdl-plugin-policy-go@<version>" // Use a version from plugin releases
      schema "./schema.vdl"
      outDir "./policy"
      options {
        package "policy"
        typesImport "example.com/project/types"
      }
    }
  ]
}
```

3. Run your normal VDL generation command:

```bash
vdl generate
```

4. Check the generated output in `./policy`:

## Plugin Options

| Option        | Required | Default         | Meaning                                                                                               |
| ------------- | -------- | --------------- | ----------------------------------------------------------------------------------------------------- |
| `package`     | no       | `"policy"`      | Go package name used in the generated file.                                                           |
| `outFile`     | no       | `"policies.go"` | Generated Go filename inside `outDir`. The file must end with `.go`.                                  |
| `typesImport` | no       | `""`            | Import path of the types package. Empty means the policy code lives in the same package as the types. |

When `typesImport` is set, model references are qualified as `vdltypes.ModelName` and imported as `vdltypes "<path>"`.

Example with all options:

```vdl
const config = {
  version 1
  plugins [
    {
      src "varavelio/vdl-plugin-policy-go@<version>" // Use a version from plugin releases
      schema "./schema.vdl"
      outDir "./gen"
      options {
        package "audit"
        outFile "audit_policies.go"
        typesImport "example.com/project/types"
      }
    }
  ]
}
```

## Policy Annotation Model

This plugin follows the VDL `@policy` specification (VPP-3):

- Spec: https://vdl.varavel.com/docs/protocols/policy/

Core rules enforced by the SDK validation used here:

- `@policy({ allow, deny?, version? })` must be attached to a top-level object type
- `allow` is required and non-empty, `deny` is optional and non-empty when present
- policy fields must be `principal`, then `resource`, then `context`, all required when present
- each root must reference a named VDL object type
- expressions only use declared roots with typed field paths
- every expression must evaluate to `bool` with explicit `has()` guards for optional access

Example:

```vdl
type User {
  id string
  role string
  department? string
  disabled bool
}

type Invoice {
  ownerId string
  amount float
}

@policy({
  version 1
  allow "
    principal.id == resource.ownerId ||
    has(principal.department) &&
    principal.department == 'Finance'
  "
  deny "principal.disabled == true"
})
type CanApproveInvoice {
  principal User
  resource Invoice
}
```

## What You Get

- `VDLPolicyCatalog`: top-level struct grouping per-policy anonymous structs
- `VDLPolicies`: variable holding the fully typed policy catalog with `Check` function references
- `VDLPolicyNames`: variable holding every policy name in sorted order

All generated policies are consolidated into a single Go file.

## Generated Go Shape

Given this schema:

```vdl
@policy({
  allow "principal.role == 'admin'"
})
type CanAccessPanel {
  principal User
}
```

The generated Go output is similar to (comments were reduced for brevity):

```go
type VDLPolicyCatalog struct {
  CanAccessPanel struct {
    Name string
    Check func(vdltypes.User) bool
  }
}

var VDLPolicies = VDLPolicyCatalog{
  CanAccessPanel: struct {
    Name string
    Check func(vdltypes.User) bool
  }{
    Name: "CanAccessPanel",
    Check: canAccessPanel,
  },
}

var VDLPolicyNames = []string{
  "CanAccessPanel",
}

func canAccessPanel(principal vdltypes.User) bool {
  return (principal.Role == "admin")
}
```

Each function evaluates `deny` first and returns `false` immediately, then returns `allow`.

The catalog is the API, check functions stay unexported and every call goes through `VDLPolicies`:

```go
policy.VDLPolicies.CanAccessPanel.Check(user)
policy.VDLPolicyNames
```

## Type Mapping

| VDL        | Go output   |
| ---------- | ----------- |
| `string`   | `string`    |
| `int`      | `int64`     |
| `float`    | `float64`   |
| `bool`     | `bool`      |
| `datetime` | `time.Time` |

Named field, type, and enum member names follow `vdl-plugin-go` PascalCase rules. Optional VDL fields are expected as Go pointers with nil checks.

## Expression Behavior

- `&&`, `||`, and `!` map directly with explicit parentheses.
- `==` and `!=` are null-safe: missing optional values fail `==` and pass `!=`.
- `>`, `>=`, `<`, and `<=` use native operators, except `datetime` which uses `Before`, `After`, and `Equal`.
- `in` with a literal list expands to an `||` chain without extra imports.
- `in` with a field reference uses `slices.Contains`, imported only when needed.
- `has(ref)` expands to a nil chain for optional segments.
- Enum literals map to native constants such as `InvoiceStatusLocked`.
- `datetime` fields compare with methods, never with literals.

## Validation Behavior

Generation fails with structured plugin diagnostics when:

- `@policy` is missing `allow` or uses an unsupported `version`
- a policy field is optional, out of order, or not a named object type
- an expression uses an unknown root, field, or enum value
- an expression mixes incompatible types or misses a required `has()` guard
- two policies collide to the same Go function name
- `outFile` does not end with `.go`

## Notes

- If the schema contains no valid `@policy` types, the plugin emits no files.
- Models and policies may share one package: check functions are unexported, so `Can*` model structs never collide. Use separate packages with `typesImport` for larger layouts.
- The plugin only generates check functions and the policy catalog.
- The plugin does not generate generic Go models, enums, or payload structs.
- Generate payload contracts with [`varavelio/vdl-plugin-go`](https://github.com/varavelio/vdl-plugin-go).
- This plugin is intended specifically for the VDL policy specification, not full Go model generation.

## License

This plugin is released under the MIT License. See [LICENSE](LICENSE).
