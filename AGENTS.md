# VDL Plugin Template

## Summary

VDL is the open-source cross-language definition engine for modern stacks. Define your data structures, APIs, contracts, and generate type-safe code for your backend and frontend instantly.

This project contains a VDL plugin written in TypeScript that is responsible for generating code that the VDL binary will then write to the user's system or for returning errors that will be displayed to the user when attempting to generate code using this plugin.

To create the plugin, we are using the VDL Plugin SDK. It is IMPERATIVE that you download and read the manual for using the SDK BEFORE starting ANY task, as it defines and explains many important things. It is also important that you use the manual information when writing tests or any utility code, as it contains helpers that should be used whenever possible to avoid duplicating code and keep the code of all VDL plugins in a similar way.

## Docunentation

Always read this documentation before any task:

- VPP-3 Policy spec: https://vdl.varavel.com/docs/protocols/policy/index.md
- VDL Plugin SDK: https://vdl-plugin-sdk.varavel.com/llms.txt
- VDL Plugin SDK Policy Parser: https://vdl-plugin-sdk.varavel.com/docs/api/policy/index.md

## Maintaining this Document

After completing any task, review this file and update it if you made structural changes or discovered patterns worth documenting. Only add information that helps understand how to work with the project. Avoid implementation details, file listings, or trivial changes. This is a general guide, not a changelog.

When updating this document, do so with the context of the entire document in mind; do not simply add new sections at the end, but place them where they make the most sense within the context of the document.

## Working Notes

- Keep implementations aligned with SDK patterns from the manual.
- Use the SDK utility functions when possible to avoid duplicating code.
- `e2e/` this directory contains end to end tests. Recommended structure: one fixture folder per test.
- Source layout is `shared/`, `options/`, `policy/`, and `go/` under `src/`, mirroring the events and http-rpc plugins.
- Plugin options are `package` (default `policy`), `outFile` (default `policies.go`), and `typesImport` (default empty for same-package output, using the fixed `vdltypes` alias when set).
- Generated output is one exported `Can*` function per policy plus `VDLPolicyCatalog` / `VDLPolicies` / `Names()`, with deny evaluated before allow.
- E2E fixtures use `typesImport` with a hand-written `types/` package and a `main.go` runtime check, verified with `go build ./...` and `go run .`. VDL wipes `gen/`, so no hand-written files belong there.
- The Dockerfile provides the Go 1.27 toolchain because e2e compilation needs it.
