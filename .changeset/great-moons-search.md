---
"@edwardseshoka/contracts": major
---

Add `noteCount` to `MemberContract`, so members can be projected into search.

**Breaking:** `noteCount` is required, so anything constructing a
`MemberContract` must supply it. Records written before this field existed need
no migration — a missing value reads as `0`, which is a true statement about a
member who has written no notes, not a stand-in for "unknown".

Search's `PERSON` row needs a `{ kind: "noteCount", count }` meta line, and a
projection cannot run an aggregate over the social table while writing a row.
The count is therefore denormalised onto the member record, matching
`Producer.wineCount` and `Region.wineCount`, which exist for the same reason.

Members are searchable by default — the product follows the reach model of a
social network rather than an opt-in directory. The projected row stays thin
(name, profile type, note count): enough to render a result and route to a
profile, never contact details, address or coordinates.
