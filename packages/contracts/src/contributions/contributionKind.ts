/**
 * What a contribution can be. Ordered as the filter chips read, not as the
 * corpus is weighted.
 *
 * ## The kind that is deliberately missing
 *
 * There is no `collection`. Member collections — the "six bottles for a Cape
 * winter" playlist — are owned by the cellar's taxonomy, along with itineraries
 * and lenses, and that design pass has not landed. Inventing the shape from the
 * ledger's side would give the cellar a definition written by a surface that
 * only reads it. Everything else ships without it; the kind simply stays absent
 * from the wire until the cellar names it.
 */
export type ContributionKind = "note" | "editorial" | "tasting";

export const CONTRIBUTION_KINDS = [
  "note",
  "editorial",
  "tasting"
] as const satisfies readonly ContributionKind[];
