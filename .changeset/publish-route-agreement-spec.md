---
"@edwardseshoka/contracts": minor
---

Publish the route agreement rules — `@edwardseshoka/contracts/spec`.

Composition lives in the backend, so a rule about how a route's numbers are computed
exists twice: once in the samples generator, once in whatever serves
`GET /collections`. Nothing tied the two copies together, and a rule held in two places
is a rule that drifts — `authorshipLens` has carried a "the server's decision, modelled
here" comment for exactly this reason.

These are the tie. They take DATA rather than a fixture, so this repo runs them over its
seeds and the backend runs the SAME FUNCTIONS over real endpoint responses. When the two
disagree, one composer is wrong and the error names the rule it broke.

**Rules, not bundles — and that is the whole design.** A published assertion fails
somebody else's build, so it may never dictate without an opt-out. Shipping seven fat
functions each checking eight things would impose all fifty-six on every consumer with
no way to decline one but to fork the file. So every rule is its own named export,
grouped in a record per surface:

- `ROUTE_CARD_RULES` — a card against the page it opens: subject, mode, `itemCount`
  equals stops, the tally matches what is nested, a plan carries none, stop ids unique,
  the strip keys on stops and stays shorter than the list.
- `ROUTE_STOP_RULES` — places and pours resolve, dates are calendar days, an event ref
  carries no booking, an event title is negotiated text.
- `LEDGER_RULES` — a route's notes take no row of their own, and still count on the wine
  they judge. The tempting shortcut (keeping them out of the corpus entirely) passes the
  first and fails the second, which is why both exist.
- `CHIP_RULES` — `count` is rows, `nestedCount` is what another row speaks for and is
  absent when nothing is, and only notes can nest.
- `CELLAR_RULES` — the projection counts wines not bottles, a met wine carries no
  possession facts, it states its stop ordinal, its place name is canonical text, and
  provenance sits beside possession rather than replacing it.
- `FIRST_MET_RULES` — a wine met twice credits the earlier DAY, not the route published
  first.

Declining a rule is not calling it. **There are no skip flags and no options bag**,
because a rule that can be switched off silently reads as passing when it is disabled.
A consumer iterates a record to opt in to future strictness, or names a subset to pin.

Failures throw `RouteAgreementError`, which carries the rule name — **a plain `Error`
subclass, never `node:assert`**. This package is bundled by the frontend and
`node:assert` would be the first Node builtin to ship in it; a thrown error also works
under any test runner rather than tying the spec to one.

Not re-exported from the package root. A spec is opt-in, and an app that only renders
contracts should not pull assertion code into its bundle by importing the root.

**Versioning from here.** Adding a rule is a MINOR — only consumers who iterate a record
are affected, and that was their choice. Changing what a named rule means, or renaming
or removing one, is a MAJOR.
