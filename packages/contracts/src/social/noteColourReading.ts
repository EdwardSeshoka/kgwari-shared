import type { ColourReadingKey, RimReadingKey } from "../vocabulary/index.js";

/**
 * What the wine looked like — the core, and the edge.
 *
 * Two fields rather than one because they date different things. The core says
 * what colour the wine is; the rim says how far through its life it is, and a
 * garnet wine with a tawny edge is a specific, useful observation that one field
 * cannot hold. See {@link RIM_READINGS}.
 */
export type NoteColourReadingContract = {
  coreKey: ColourReadingKey;
  rimKey?: RimReadingKey;
};
