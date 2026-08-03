/**
 * Grape varieties.
 *
 * A **chrome key** vocabulary: the server sends the key, the client renders the
 * word from its own catalog, and the index holds the key — so browsing works in
 * every locale without one translated word in it.
 *
 * Declared here rather than in the seed generator, which was the de-facto source
 * of truth for which keys existed: unenumerable for locale parity, and
 * uncheckable against the contracts it fed.
 */

/**
 * **Keys, not display names**, which is the correction this file exists for. The
 * generator held `"Cabernet Sauvignon"` and derived `grape.cabernetSauvignon`
 * with a string transform, so the valid key set was whatever that transform
 * happened to produce — rename a grape and the key silently changed, leaving a
 * catalog entry pointing at nothing. The key is the identity; the word is the
 * client's.
 */
export const GRAPES = [
  "grape.cabernetSauvignon",
  "grape.merlot",
  "grape.cabernetFranc",
  "grape.petitVerdot",
  "grape.pinotage",
  "grape.syrah",
  "grape.shiraz",
  "grape.grenache",
  "grape.mourvedre",
  "grape.cinsaut",
  "grape.cheninBlanc",
  "grape.chardonnay",
  "grape.sauvignonBlanc",
  "grape.semillon",
  "grape.riesling",
  "grape.pinotNoir",
  "grape.pinotGris",
  "grape.pinotGrigio",
  "grape.grunerVeltliner",
  "grape.gewurztraminer",
  "grape.nebbiolo",
  "grape.sangiovese",
  "grape.barbera",
  "grape.corvina",
  "grape.nerelloMascalese",
  "grape.tempranillo",
  "grape.garnacha",
  "grape.albarino",
  "grape.palomino",
  "grape.mencia"
] as const;

export type GrapeKey = (typeof GRAPES)[number];
