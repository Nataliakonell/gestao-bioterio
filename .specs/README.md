# Spec-Driven Development (SDD)

Each feature starts with a SPEC document. The SPEC is written **before** any code, reviewed by the team, and only then implemented.

## Workflow

```
  Idea → SPEC.md → Review → Approve → Implement → Test → Ship
```

## Why?

- Forces clarity on WHAT before HOW
- Catches missing requirements early
- Serves as living documentation
- Makes A2A test cases explicit before writing them

## File naming

`.specs/{entidade}.md` — one file per entity/feature.

## Template

Every SPEC should contain:

1. **Contrato da API** — endpoints, request/response shapes
2. **Comportamento esperado** — business rules and constraints
3. **Casos de teste (A2A)** — numbered test scenarios with expected results

See existing `.specs/*.md` for examples.
