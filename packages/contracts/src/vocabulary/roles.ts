/**
 * Roles a person is credited under on a record.
 *
 * Closed because a role is a CLAIM about who someone is — "cellarmaster" beside
 * a name on an estate's own account carries the estate's authority. An open
 * string would let a claimant credit anyone as anything, which is the class of
 * unattributed assertion this record model exists to remove.
 */
export const RECORD_ROLES = [
  "role.cellarmaster",
  "role.winemaker",
  "role.viticulturist",
  "role.owner",
  "role.sommelier"
] as const;

export type RecordRoleKey = (typeof RECORD_ROLES)[number];
