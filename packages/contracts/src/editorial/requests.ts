import type { ArchiveLensKey, LensRowContract } from "../lenses/index.js";
import type { EditorialContract } from "./editorial.js";

/**
 * The ARCHIVE landing — everything written, newest first.
 *
 * ## Why the lens here is WHO and not what
 *
 * At launch the archive holds two voices at very different volumes — the
 * Profile measured the same split at 69:1 — and pure recency hides the rarer
 * one entirely. An estate's piece and a member's are both writing; what a reader
 * arrives wanting is usually one or the other, and a content-type lens would
 * offer six words for a distinction nobody came for.
 *
 * The kind is still legible: it sits on the row as a detail beside the date,
 * read from `contentType`. It is simply not the question the list is asked.
 */
export type ListEditorialRequest = {
  /** Absent means `lens.all`. See {@link ARCHIVE_LENSES}. */
  lens?: ArchiveLensKey;
  cursor?: string;
  limit?: number;
};

export type ListEditorialResponse = {
  items: EditorialContract[];
  lenses: LensRowContract;
  /** Opaque. Absent when this is the last page. */
  nextCursor?: string;
};
