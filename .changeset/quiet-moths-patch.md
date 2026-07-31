---
"@edwardseshoka/contracts": minor
---

Correct the member contract's routes, and give `PATCH /members/me` a request type.

The docblocks described `/user/profile` while the backend and frontend both use
`/members/me`. Reported as "one of the two is wrong"; neither was. The member
resource moved to `/members/me`, and `GET /user/profile` survives as a deprecated
**read-only alias** so already-shipped clients keep working. The contract was
simply documenting the retired address.

The write side was worse than stale. `SaveMemberProfileRequest` documented
`POST /user/profile`, a route that no longer exists in any form: it took a whole
profile, so it could only express "replace everything", and a client that omitted
a field silently reset it — a member editing their taste note lost their address.

New:

- `PatchMemberProfileRequest` — the body `PATCH /members/me` accepts. Derived as
  `Partial<Omit<MemberContract, "userId" | "createdAt" | "noteCount" |
  "profileType">>` rather than restated, so a field added to the profile is
  patchable without anyone remembering, and a removed one cannot linger. Verified
  key-for-key against the backend's zod schema: 16 fields, exact match. `null`
  clears a value and omission leaves it alone — a distinction a full-body PUT
  cannot express.
- `PatchMemberProfileResponse` — the updated `MemberContract`. The whole member
  comes back rather than `{ success: true }`, because server-owned fields
  (`noteCount`, a system-assigned `profileType`) can change as a side effect and
  an acknowledgement leaves the client holding a stale copy it believes is
  current.

`SaveMemberProfileRequest` and `SaveMemberProfileResponse` are deprecated, and
`GetMemberProfileResponse` now names `/members/me` with the alias explained.
