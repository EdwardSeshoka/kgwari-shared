/**
 * Vineyard soil — an estate-private fact, answered only by a producer claim.
 *
 * A **chrome key** vocabulary: the server sends the key, the client renders the
 * word from its own catalog, and the index holds the key — so browsing works in
 * every locale without one translated word in it.
 *
 * Declared here rather than in the seed generator, which was the de-facto source
 * of truth for which keys existed: unenumerable for locale parity, and
 * uncheckable against the contracts it fed.
 */

export const SOILS = [
  "soil.decomposedGranite",
  "soil.malmesburyShale",
  "soil.limestoneClay",
  "soil.aeolianSand",
  "soil.schist"
] as const;

export type SoilKey = (typeof SOILS)[number];
