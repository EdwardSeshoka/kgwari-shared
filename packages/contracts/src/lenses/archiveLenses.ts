import { LENS_ALL } from "./lensAll.js";

/**
 * Authorship, for the archive — the same question, different voices.
 *
 * At launch the archive holds two at very different volumes (the Profile
 * measured the same split at 69:1), and pure recency hides the rarer one
 * entirely. That is what the lens is for here: not tidiness, but making the
 * scarce voice reachable.
 *
 * The content type is NOT the question. It stays legible on the row beside the
 * date, read from `contentType`; a lens over it would offer six words for a
 * distinction nobody arrives wanting.
 */
export const ARCHIVE_LENSES = [LENS_ALL, "lens.estates", "lens.members"] as const;

export type ArchiveLensKey = (typeof ARCHIVE_LENSES)[number];
