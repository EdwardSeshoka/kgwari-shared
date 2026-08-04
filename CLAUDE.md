# Kgwari — shared

The contracts and sample data both other repos build against. Published to npm
via changesets; a change here lands in the frontend and backend only after a
release.

## Read these before writing code

- [Unit testing standards](../kgwari-docs/architecture/unit-testing-standards.md)
- [Naming conventions](../kgwari-docs/architecture/naming-conventions.md)

## The rules that get broken most

**A contract is a design document.** Every type carries the reasoning for its
shape — why a field is required, why a section exists, what a consumer gets
wrong first. That prose is the deliverable as much as the type is.

**Ship the stub with the type.** Every contract has a `StubFactory`, and its
named variants encode the states that matter — `makeSuppressed`, `makeQuiet`,
`makeUndescribed`, `makeWithUnknownSection`. If a consumer has to hand-roll a
fixture for a real case, the double is missing one.

**`defineStub` exists to stop casts.** The base is a parameter of type `T`, so
the literal is checked where it is written. One cast survives, on the spread,
and it cannot hide a missing field.

**Samples are GENERATED, never hand-edited.** `packages/samples/generator/`
composes from the curated pools in `generator/orig-*.json`. Editing
`src/features/**` output directly is overwritten on the next run — and the pool
is what the backend actually seeds from.

**Sort by the field that means it.** The archive sorted by ID for months
because there was no date to disagree with; the heading said "newest first" the
whole time.

## Commands

```bash
npm run typecheck
npm test
node packages/samples/generator/index.mjs   # regenerate, then npm run build
npm run changeset:status
```

Every published change needs a changeset. Breaking a required field is a major.
