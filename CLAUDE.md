# Kgwari — shared

The contracts and sample data both other repos build against. Published to npm
via changesets; a change here lands in the frontend and backend only after a
release.

## Read these before writing code

Canonical standards live in **kgwari-docs**, checked out here as a **submodule**
at `kgwari-docs/`, so these links resolve at the revision they were written
against. Clone with `--recurse-submodules`; an existing checkout catches up with
`git submodule update --init`. CI does not check it out: nothing a gate runs
reads a document, and the repository is private.

**It is read-only from here.** Edit docs in a clone of kgwari-docs itself; the
pin moves deliberately, as its own commit:

```bash
git submodule update --remote kgwari-docs
git add kgwari-docs && git commit -m "docs(all): Bump kgwari-docs"
```

- [Unit testing standards](kgwari-docs/architecture/unit-testing-standards.md)
- [Naming conventions](kgwari-docs/architecture/naming-conventions.md)

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

**Every display string declares its source.** Three carriers, and a bare
`string` is a decision that has to be argued for in the prose:

| Carrier          | For                                                    |
| ---------------- | ------------------------------------------------------ |
| `CanonicalText`  | proper nouns — an estate, a label, a person, a cert no. |
| `ChromeText`     | closed vocabularies — the server sends the key only     |
| `NegotiatedText` | curated prose, an exonym, a member's own words          |

Numbers are not strings either: `Measurement` for a quantity with a unit,
`YearRange` for a span of years. **The server never sends a composed sentence, a
formatted number or a formatted date** — word order, plural rules and separators
belong to the presentation edge. "214 readings" hardcodes English plurals;
"14.21 %" hardcodes a separator that is a comma across most of Europe.

New contracts must not inherit the legacy `title` + `titleLanguage` pair that
`EventContract` still carries. Two fields that must agree are two fields that
eventually will not; `NegotiatedText` carries the tag with the text.

## Introducing a new contract

In this order, because each step hardens the one before it.

1. **Contract.** The type and its reasoning, in
   `packages/contracts/src/<domain>/`. Export it from that domain's `index.ts`.
2. **Localisation.** Walk every field: which carrier, or why bare. Do this
   BEFORE the doubles exist — a stub built around a bare string has to be
   rewritten when the field becomes `NegotiatedText`, and so does every test
   that asserted on it.
3. **Contract stubs.** A `StubFactory` in `<domain>/test-doubles/`, exported
   from that folder's `index.ts`. `defineStub` takes the base as a parameter of
   type `T`, so the literal is checked where it is written — never a cast. A
   named variant per state that matters, and REMOVE optionals rather than
   emptying them: `preview: []` lets a client that draws an empty strip pass.
   Compose from other published doubles instead of restating their literals.
4. **Seeds.** A generator stage in `packages/samples/generator/stages/`, wired
   into `index.mjs` and emitted to `src/features/<domain>/`. Draw from `spread`,
   never `rnd`, unless the stage runs last — the shared stream means a new stage
   re-rolls everything downstream, including ids referenced from outside.
   Derive counts from the rows rather than inventing them: a card that is told
   "9 wines" can disagree with the page it opens, and one that is handed the
   stops cannot.
5. **Seed factory.** A typed accessor over the generated JSON in
   `packages/samples/src/features/<domain>/` — a `create*` function or a
   `*Samples` object. Throw on an id the fixture does not carry; returning
   `undefined` surfaces a fixture bug as a blank page three layers away.
6. **Tests.** `ContractsTests/` for the decisions the type cannot state —
   mostly ABSENCES, which is exactly what a type cannot assert.
   `SamplesTests/` for fixture integrity: every id resolves, every denormalized
   count agrees with what it counts.
7. **Changeset.** Additive is a minor. Breaking a required field, or changing
   what an existing value means, is a major — say which, and say what breaks
   silently.

### What the other repos actually get

Both packages publish `files: ["dist"]`, so the line falls in one place:

- **Shared.** Every contract type; every `StubFactory`, via
  `@edwardseshoka/contracts/<domain>/test-doubles`; the **specs**, via
  `@edwardseshoka/contracts/spec`; the generated JSON and its `create*`
  accessors, via `@edwardseshoka/samples/<domain>`.
- **Not shared.** `packages/samples/generator/` — it sits outside `src/`, so it
  never reaches `dist`. `buildRoutes`, `buildCollections` and `buildMasthead`
  are build-time scripts, not importable.

That is deliberate: **composition lives in the backend.** Samples record its
OUTPUT so the backend's own mapper is what a double exercises — a shared
composer would be a second implementation to diverge from.

The cost is that a rule the generator models — deriving a route's `itemCount`
and `contents` from its stops, or `authorshipLens` mapping a byline to a chip —
exists twice. `contracts/src/spec/` is what ties the copies together: assertions
over DATA, so this repo runs them on the seeds and the backend runs the same
functions on real responses. When you add such a rule, add its check there.

## Writing a shared spec

A published assertion **fails somebody else's build**, so it may never dictate
without an opt-out.

**Rules, not bundles.** One named export per rule, grouped in a record per
surface (`ROUTE_CARD_RULES`, `CELLAR_RULES`). Declining a rule is then simply not
calling it. **No skip flags and no options bag** — a rule that can be switched
off silently reads as passing when it is disabled.

That gives a consumer two honest postures, and imposes neither:

```js
for (const rule of Object.values(ROUTE_CARD_RULES)) rule(input)  // opt in to future rules
ROUTE_CARD_RULES.itemCountEqualsStops(input)                     // pinned
```

**One input type per record**, with everything its rules need. A rule that
quietly no-ops when an input is missing is the skip flag again, wearing a hat.

**Throw a plain `Error` subclass carrying the rule name — never `node:assert`.**
This package is bundled by the frontend, and `node:assert` would be the first
Node builtin to ship in it; a thrown error also works under any test runner.

**Versioning.** Adding a rule is a MINOR — only consumers who iterate a record
are affected, and that was their choice. Changing what a named rule means, or
renaming or removing one, is a MAJOR.

## Commands

```bash
npm run typecheck
npm test
node packages/samples/generator/index.mjs   # regenerate, then npm run build
npm run changeset:status
```

Every published change needs a changeset. Breaking a required field is a major.
