---
"@edwardseshoka/contracts": minor
---

Refine and extend the contract test doubles.

Adds a shared `defineStub` helper under `test-doubles/` and builds the existing stub factories on top of it, so every stub takes the same `Overrides<T>` shape (overrides that may explicitly remove a field under `exactOptionalPropertyTypes`).

Adds stub factories and new `test-doubles` export subpaths for the domains that were missing them:

- `./money/test-doubles` — `MoneyContract`, `TransactedMoneyContract`
- `./trust/test-doubles` — `TrustBylineContract`, `WineClaimContract`
- `./provenance/test-doubles` — `RegionContract`, `AppellationContract`, `ProducerContract`
- `./social/test-doubles` — `ActivityContract`, `TastingNoteContract`
- `./editorial/test-doubles` — `EditorialContract`
- `./events/test-doubles` — `EventContract`
- `./discover/test-doubles` — `DiscoverContract`, `DiscoverDoorwayContract`, `DiscoverWineHeroContract`
- `./text/test-doubles` — `LocalizedText`

Existing stub call signatures are unchanged.
