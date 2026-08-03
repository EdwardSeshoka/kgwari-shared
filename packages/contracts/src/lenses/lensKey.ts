/**
 * The words a lens row can offer.
 *
 * ## A lens is not a tab, and the vocabulary follows from that
 *
 * A tab is a place: it replaces the view and owes you a way back. A lens narrows
 * what is already there and owes nothing — the heading, the order and the scroll
 * position keep meaning the same thing, so it adds no depth to the hierarchy at
 * all. That is what licenses it on a page already one push deep.
 *
 * Chrome keys, so the chip reads in every locale and the index holds the key.
 * They are declared here rather than per surface because this is ONE mechanism
 * used in several places — the Cellar's lenses, the Profile's writing chips, and
 * the four pushed landings — and a second copy of "all" is a second translation
 * of the same word.
 *
 * ## The sets are per list, and deliberately not merged
 *
 * A diary is asked WHEN. An archive is asked WHO. The two collection landings
 * are asked WHO as well, and get the SAME four words — which is not a
 * coincidence to be tidied away but evidence they are one record with two
 * subjects. What is shared is the mechanism; the vocabulary is shared only where
 * the question genuinely is.
 */

import { ARCHIVE_LENSES, type ArchiveLensKey } from "./archiveLenses.js";
import { CALENDAR_LENSES, type CalendarLensKey } from "./calendarLenses.js";
import { COLLECTION_LENSES, type CollectionLensKey } from "./collectionLenses.js";

/** Any lens word the system offers. */
export type LensKey = CollectionLensKey | ArchiveLensKey | CalendarLensKey;

/**
 * Every lens key, deduped, so a locale catalogue can be checked against the set.
 *
 * The sets deliberately SHARE words — `lens.all` is in all three and
 * `lens.members` in two — so a list that did not dedupe would ask for the same
 * translation twice and turn a parity check into a lie about how much is left.
 */
export const LENS_KEYS: readonly LensKey[] = [
  ...new Set<LensKey>([...COLLECTION_LENSES, ...ARCHIVE_LENSES, ...CALENDAR_LENSES])
];
