/**
 * Aromas members report on a tasting note.
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
 * Split by where they plausibly occur, and the split belongs to the vocabulary
 * rather than to one caller: a generator picking aromas for a white wine and a
 * client offering aroma choices on a note both need to know that
 * `aroma.blackcurrant` does not belong to a Chenin. Keeping both lists here
 * means neither re-derives it.
 */
export const AROMAS_RED = [
  "aroma.blackcurrant",
  "aroma.wildPlum",
  "aroma.violet",
  "aroma.fynbosSmoke",
  "aroma.cedar",
  "aroma.clove",
  "aroma.graphite",
  "aroma.driedFig",
  "aroma.curedMeat"
] as const;

export const AROMAS_WHITE = [
  "aroma.greenApple",
  "aroma.citrusPeel",
  "aroma.whiteFlower",
  "aroma.wetStone",
  "aroma.beeswax",
  "aroma.toastedGrain",
  "aroma.driedApricot"
] as const;

export type AromaKey = (typeof AROMAS_RED)[number] | (typeof AROMAS_WHITE)[number];

/** Every aroma, so a catalogue-parity check cannot miss half of them. */
export const AROMAS: readonly AromaKey[] = [...AROMAS_RED, ...AROMAS_WHITE];
