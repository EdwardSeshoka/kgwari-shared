import { LENS_ALL } from "./lensAll.js";

/**
 * Authorship, for a list of LISTS — shelves and itineraries.
 *
 * Four words, and `lens.kgwari` is one of them rather than a band above the
 * others. The moment the house's lists get a section of their own, the page has
 * invented the curated badge the taxonomy refused; as a lens they sort by date
 * beside the members' and the sommeliers', and the byline does the
 * distinguishing exactly as it does on the row.
 *
 * There is deliberately NO region lens. Geography is what doorways are for,
 * because a region's contents come from a query — Stellenbosch has its wines
 * whether or not anybody arranged them — while a collection's came from a
 * person. Six routes across six regions is also a chip row of six ones: six
 * controls that each remove five rows.
 *
 * Both landings take the SAME four words, which is not a coincidence to be
 * tidied away but evidence they are one record with two subjects.
 */
export const COLLECTION_LENSES = [
  LENS_ALL,
  "lens.sommeliers",
  "lens.members",
  "lens.kgwari"
] as const;

export type CollectionLensKey = (typeof COLLECTION_LENSES)[number];
