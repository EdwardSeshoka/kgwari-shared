---
"@edwardseshoka/contracts": minor
---

feature(contracts): ship the two missing test doubles

Every contract a consumer holds should have a double shipped from the same
package as the contract, so a field that moves breaks the consumer at compile
time. Two did not, and both gaps had already cost something.

**`@edwardseshoka/contracts/member/test-doubles` — new export.** The source
directory existed and was empty; nothing has ever been published from it, so
every consumer wrote its own member fixture. The frontend's copy is what
`MemberContract.noteCount` becoming required in 6.0.0 landed on: nothing pointed
at the hand-written stub, so the gap surfaced only when that repo upgraded — two
majors and several weeks later. `MemberContract.StubFactory` now offers `make()`
(an onboarded enthusiast, every nullable field explicitly `null` because `null`
is what the wire carries), `makeEstate()` (a verified business account with its
business fields populated together — a persona without a `businessName` is a
state onboarding does not produce) and `makeOnboarding()` (signed up, nothing
filled in, `noteCount: 0` rather than absent, since a member who has written
nothing has written nothing).

**`SearchBrowseGroupContract.StubFactory` — added to the existing
`search/test-doubles`.** `SearchResultContract` shipped a double when search rows
became localisable; its browse-group companion did not. The consequence was
visible in the frontend, which carried a hand-written one still declaring `id`
plus `labelKey` and a pre-formatted `count: "312"` long after the contract had
collapsed the first two into one closed `key` and made the third a number.

The three factories are chosen to cover the three text sources a way-in label can
have, because that is the distinction the shape exists to carry: `make()` is the
region group (canonical proper nouns), `makeVerdict()` is chrome — and is the
case that proves `query` cannot default to the label, since the member reads
"Inoubliable" while the index holds `Unforgettable` — and `makeCountry()` is
negotiated, an exonym carrying the language it actually came back in.

Purely additive: no existing type or export changes.
