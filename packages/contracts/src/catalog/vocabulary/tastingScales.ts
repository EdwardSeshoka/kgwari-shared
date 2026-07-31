/**
 * The five rungs of each tasting metric, low to high.
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
 * Empty strings are deliberate. The middle rungs of a five-point scale are
 * unlabelled, so only the ends and the centre carry a word — and sending `""`
 * rather than omitting the rung keeps the array positional, which is what lets
 * a client render a mark at index 3 without counting labels.
 */
export const TASTING_SCALES = {
  tannin: ["tasting.low", "", "tasting.medium", "", "tasting.high"],
  acidity: ["tasting.low", "", "tasting.medium", "", "tasting.high"],
  body: ["tasting.light", "", "tasting.medium", "", "tasting.full"],
  finish: ["tasting.short", "", "tasting.medium", "", "tasting.long"]
} as const satisfies Readonly<Record<string, readonly [string, string, string, string, string]>>;

export type TastingMetricKey = keyof typeof TASTING_SCALES;

/**
 * Every word a scale rung can read as.
 *
 * DERIVED from the scales rather than listed again, so a rung cannot be added to
 * a metric without becoming a legal `wordKey` — the two would otherwise be two
 * declarations of one vocabulary, which is how `VERDICTS` came to exist twice
 * with different lengths.
 */
export type TastingWordKey = Exclude<
  (typeof TASTING_SCALES)[TastingMetricKey][number],
  ""
>;
