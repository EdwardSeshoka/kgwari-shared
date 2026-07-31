import type { WineRecordContract } from "@edwardseshoka/contracts/catalog";

import rawRecords from "./wine-records.json" with { type: "json" };

const records = rawRecords as unknown as WineRecordContract[];

/**
 * Wine detail records — the deep document behind a wine, in the same
 * `WineRecordContract` shape the catalog api serves. One per wine in
 * {@link createWines}, so any wine a client opens has a record.
 *
 * GENERATED — do not hand-edit `wine-records.json`. It comes out of
 * `generator/generate.mjs` alongside every other seed, and `npm run
 * check:seeds` fails the build if the file and the generator disagree.
 *
 * The generator is where the record model actually lives. A reference row is a
 * pure function of the wine and the source that matched it, declared once in
 * `REFERENCE_FIELDS`, which is why adding a field to `WineRecordContract` is one
 * row there rather than ninety-three edits here. Nothing in that table can
 * produce an estate-private row and nothing outside it can produce a reference
 * one, so the taxonomy holds by construction.
 *
 * Only what no algorithm can derive is authored: `generator/orig-wine-records.json`
 * holds the estate's essay, the cellarmaster's line, the seals and the
 * most-saved member note. A generator has no business inventing either an
 * estate's own writing or a member's own words.
 */
export function createWineRecords(): WineRecordContract[] {
  return records;
}

/** The record for one vintage, or null — mirrors `GET /wines/{id}/record`. */
export function createWineRecord(
  wineVintageId: string
): WineRecordContract | null {
  return records.find((r) => r.wineVintageId === wineVintageId) ?? null;
}
