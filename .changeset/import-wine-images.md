---
"@edwardseshoka/samples": patch
---

Give the four imported wines label images.

`public-wines.json` carried an `imageUrl` for every South African wine but none
of the imports (Château Pichon Baron, Vietti Castiglione Barolo, Ridge Monte
Bello, Larmandier-Bernier Latitude). `imageUrl` is optional in the contract, so
these resolved to `undefined` and rendered the `MediaPlaceholder` mesh — most
visibly on Vietti, which sits in "Worth opening now" via its Unforgettable
verdict. All four now carry a verified image, so every wine in the pool has one.

The discover app-double fixture (`discover-response.json`) is regenerated from
the pool by `generateDiscoverFixture.mjs`, so it picks up the new images. The
regeneration also realigns "Worth opening now" with the current
`composeDiscover` ranking (verdict rank, then note count) — the committed
snapshot predated that ordering — bringing the local double back in step with
what the backend composes.
