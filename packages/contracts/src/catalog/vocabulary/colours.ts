/**
 * The colour a wine reads as, from member observations.
 *
 * Chrome keys, so "deep garnet" reads in every locale. The hex values a swatch
 * is drawn from are NOT here — those belong to the individual wine and travel on
 * its reading, because they are data about that bottle rather than vocabulary.
 */
export const COLOUR_READINGS = [
  "colour.paleStraw",
  "colour.deepGarnet",
  "colour.rubyRed",
  "colour.amber",
  "colour.salmonPink",
  "colour.tawny"
] as const;

export type ColourReadingKey = (typeof COLOUR_READINGS)[number];
