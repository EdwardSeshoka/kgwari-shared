---
"@edwardseshoka/contracts": minor
---

Add the cellar contract — the shape a member's holdings travel in.

There was none, so the backend was declaring `CellarHoldingContract` locally
while splitting the catalogue from the cellar: the one place still reaching its
own conclusion about what a client reads, which is exactly what the search
projections were just moved here to stop.

**Its own module, not part of `catalog`.** A catalogue is one shared set of wines;
a cellar is one member's holdings. They were the same backend interface until
recently — seven methods told apart only by the adjective "public" — and the
adjective was load-bearing because two concepts shared one seam. Putting the
cellar inside `catalog` would re-merge in the contract what the split separated.

New at `@edwardseshoka/contracts/cellar`:

- `CellarEntryContract` — a **reference plus the member's own facts**
  (`wineId`, `bottles`, `paidPrice`, `acquiredAt`, `note`), never a copy of the
  wine. A cellar row used to duplicate the whole wine, so every catalogue
  correction left a stale copy behind in each cellar holding it.
- `CellarHoldingContract` — the entry plus the resolved wine, nested rather than
  flattened so `entry.bottles` and `wine.name` say whose fact each one is at the
  point of use. `wine` is nullable: a holding outlives its catalogue entry, and
  dropping it would delete a member's record because somebody edited a catalogue.
- `ListCellarResponse`, `GetCellarEntryResponse`, `AddCellarEntryRequest`,
  `AddCellarEntryResponse`.

`paidPrice` is the first consumer of `TransactedMoneyContract`, which was written
for exactly this and had none. A paid price is the member's immutable historical
record, so it must not share a field with the distributor's current listing.

`acquiredAt` is deliberately separate from `paidPrice.asOf` rather than a
duplicate of it: wine bought en primeur is paid for on release and delivered two
or three vintages later, so one date cannot state both. A gift has an
`acquiredAt` and no price, which is the other reason the date does not simply
ride along on the money.

Test doubles at `@edwardseshoka/contracts/cellar/test-doubles`, with the variants
that carry the *why* — `makeEnPrimeur()` (the two dates genuinely differ),
`makeGifted()` (no price), `makeDrunk()` (zero bottles is a holding, not an
absent one) and `makeDelisted()` (the wine is gone, the bottles are not).

`AddWineRequest` / `AddWineResponse` are deprecated. `POST /wines` meant "put a
wine in my cellar", which is why it accepted `name`, `estate`, `region` and
`imageUrl` — a member filing their own idea of what a wine is. That is
`AddCellarEntryRequest` against `POST /cellar` now, and it takes a `wineId`.
