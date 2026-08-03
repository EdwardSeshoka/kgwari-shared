/**
 * The pour — the conditions a note was taken under.
 *
 * Not facts about the wine, and that distinction is the reason these are
 * contracted at all. Whether a taster knew what was in the glass, whether it had
 * air, what it was drunk from and how cold it was are all facts about the
 * TASTING, and every one of them changes what the note says. A register that
 * averages a blind reading with a sighted one, or a bottle poured straight from
 * the fridge with one at cellar temperature, is averaging answers to different
 * questions.
 *
 * Chrome keys throughout — the server sends the key, the client renders the
 * word, the index holds the key. Temperature is a {@link Measurement}, not a
 * member of this vocabulary: it is a number with a unit and reads "18 °C" or
 * "64 °F" depending on where the member is.
 */

/**
 * Whether the taster knew what they were drinking.
 *
 * The single most load-bearing fact about a note's independence, and the reason
 * this vocabulary leads with it. A blind note and a sighted note on the same
 * wine are not the same evidence.
 */
export const TASTED_MODES = ["pour.sighted", "pour.blind"] as const;

export type TastedModeKey = (typeof TASTED_MODES)[number];

/**
 * How much air the wine had before the note was taken. Ordered by how much,
 * least → most, so a client can render them as a run rather than a jumble.
 */
export const DECANT_STEPS = [
  "pour.straightFromTheBottle",
  "pour.openedAnHourAhead",
  "pour.decantedBriefly",
  "pour.decantedAnHour",
  "pour.decantedLonger"
] as const;

export type DecantStepKey = (typeof DECANT_STEPS)[number];

/** What it was drunk from. A shape, never a brand. */
export const GLASS_SHAPES = [
  "glass.universal",
  "glass.bordeaux",
  "glass.burgundy",
  "glass.white",
  "glass.flute",
  "glass.tumbler"
] as const;

export type GlassShapeKey = (typeof GLASS_SHAPES)[number];
