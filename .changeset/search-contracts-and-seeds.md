---
"@edwardseshoka/contracts": minor
"@edwardseshoka/samples": minor
---

Add the search contracts and seed corpus.

`@edwardseshoka/contracts/search` introduces the unified search ledger: one
`SearchResultContract` row shape covering wines, estates, regions, tastings and
people, with the facet sent explicitly so clients never own the kind→facet
table. `SearchResponse` is deliberately the query's **whole** match set —
faceting is a client concern, and a pre-filtered payload would leave the filter
index offering only the facet the member is already inside.

`@edwardseshoka/samples` adds `createSearchCorpus()` and
`createSearchBrowseGroups()`. The corpus references the same entity ids as the
catalog, provenance, events and social samples, so a seeded backend and a
frontend app double resolve results against records that actually exist.
