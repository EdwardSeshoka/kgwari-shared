/**
 * The titled runs a record is read in.
 *
 * Each group is a labelled region naming the KIND of knowledge in it — "matched
 * at ingest", "only the estate can answer" — so the argument of the page arrives
 * in two phrases before any value does.
 *
 * `labelKey` and `noteKey` are derived rather than carried, because a group key
 * of `matched` has exactly one heading and one explanation. Sending all three
 * was three chances to disagree about the same group.
 */
export const RECORD_GROUPS = [
  "matched",
  "estatePrivate",
  "estateAnswered",
  "distributorAnswered"
] as const;

export type RecordGroupKey = (typeof RECORD_GROUPS)[number];

/** Groups that explain where their contents came from. */
const GROUPS_WITH_NOTES: readonly RecordGroupKey[] = ["matched", "estatePrivate"];

export function recordGroupLabelKey(group: RecordGroupKey): string {
  return `record.group.${group}`;
}

export function recordGroupNoteKey(group: RecordGroupKey): string | undefined {
  return GROUPS_WITH_NOTES.includes(group) ? `record.group.${group}.note` : undefined;
}
