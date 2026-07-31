import type { Mapper } from "@edwardseshoka/foundation";

import type { SearchResultContract } from "../search.js";
import { facetFor, searchRowId } from "./searchRowId.js";

/**
 * What a TASTING row needs.
 *
 * `titleLanguage` now exists on `EventContract`. It matters more here than
 * elsewhere: a tasting title is authored prose, so the language it was written
 * in is part of the fact — without it the row guesses, and guessing "en" is how
 * an Afrikaans title gets served as though it were a translation.
 */
export type ProjectableEvent = {
  id: string;
  title: string;
  /** BCP 47 tag the title was authored in. */
  titleLanguage?: string;
  venueName?: string;
  startDateTime?: string;
  seatsAvailable?: number;
};

/**
 * An event → its TASTING row.
 *
 * **The title is negotiated, not canonical.** An estate or a region is a proper
 * noun — the same word everywhere. A tasting's title is prose, which is
 * translatable, so it travels with the language it was authored in. Sending it
 * as canonical would claim it needs no translation and leave no way to badge it.
 *
 * `startsAt` is required by the tasting meta, so an event without one gets no
 * meta rather than a fabricated date. It stays findable by title.
 */
export const EventToSearchRowMapper: Mapper<ProjectableEvent, SearchResultContract> = {
  map(event) {
    return {
      success: true,
      data: {
        id: searchRowId("TASTING", event.id),
        kind: "TASTING",
        facet: facetFor("TASTING"),
        entityId: event.id,
        title: {
          source: "negotiated",
          text: event.title,
          languageTag: event.titleLanguage ?? "en"
        },
        ...(event.venueName
          ? { eyebrow: { source: "canonical" as const, text: event.venueName } }
          : {}),
        ...(event.startDateTime
          ? {
              meta: {
                kind: "tasting" as const,
                startsAt: event.startDateTime,
                /**
                 * ABSENT MEANS UNCAPPED, not unknown. Defaulting to 0 would render
                 * "0 seats left" on an event nobody is excluded from.
                 */
                ...(event.seatsAvailable !== undefined
                  ? { seatsRemaining: event.seatsAvailable }
                  : {})
              }
            }
          : {})
      }
    };
  }
};
