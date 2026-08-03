/**
 * The rim — the thin edge of wine where the glass is tilted, and the single most
 * reliable read on a bottle's age.
 *
 * Its own vocabulary rather than more {@link COLOUR_READINGS}, because the two
 * answer different questions and a member answers both on one note: the core
 * says what colour the wine IS, the rim says where it is in its life. Folding
 * them into one list would let a note report a rim as a core reading, and a
 * register aggregating "tawny" could no longer tell a tawny wine from a young
 * wine with a tawny edge.
 *
 * Two runs, split the way the glass splits — reds walk violet → tawny, whites
 * walk green → amber. The split belongs to the vocabulary for the same reason
 * the aroma split does: a picker offering `rim.greenGlints` on a Cabernet is
 * offering a reading nobody can take.
 */

/** A red's rim, youngest → oldest. */
export const RIM_READINGS_RED = [
  "rim.youthfulViolet",
  "rim.ruby",
  "rim.garnet",
  "rim.tawny"
] as const;

/** A white's rim, youngest → oldest. */
export const RIM_READINGS_WHITE = [
  "rim.greenGlints",
  "rim.straw",
  "rim.gold",
  "rim.amber"
] as const;

export type RimReadingKey =
  | (typeof RIM_READINGS_RED)[number]
  | (typeof RIM_READINGS_WHITE)[number];

/** Every rim reading, so a catalogue-parity check cannot miss half of them. */
export const RIM_READINGS: readonly RimReadingKey[] = [
  ...RIM_READINGS_RED,
  ...RIM_READINGS_WHITE
];
