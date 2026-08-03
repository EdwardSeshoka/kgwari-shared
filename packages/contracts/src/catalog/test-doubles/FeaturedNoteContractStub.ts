import type { FeaturedNoteContract as FeaturedNoteContractShape } from "../record.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * The community lede: the most-saved note, promoted in its author's exact words.
 *
 * SOURCED, never authored. On an unclaimed record the page reads in a member's
 * voice rather than Kgwari's, and that is the whole mechanism — `saveCount` is
 * how a note gets chosen, and the text is reproduced verbatim rather than
 * summarised. A consumer that truncates or rewrites it has taken the member's
 * words and made them the platform's.
 *
 * `authorTier` and `authorStatus` are MUTUALLY EXCLUSIVE, the same rule
 * {@link ../trust!TrustBylineContract} runs on: a verified account renders a
 * mark and never a status word, a member renders a status word and never a mark.
 * `make()` is the member case and `makeByProfessional()` the verified one, so
 * both are covered rather than only whichever a consumer met first.
 */
export const FeaturedNoteContract = {
  StubFactory: {
    ...defineStub<FeaturedNoteContractShape>({
      noteId: "tasting-note_1",
      authorName: { source: "canonical", text: "Thandi Mokoena" },
      authorStatus: "collector",
      text: {
        source: "negotiated",
        text: "Dark fruit and a little smoke; still tightening rather than fading.",
        languageTag: "en"
      },
      saveCount: 214
    }),

    /** A verified professional's note — a mark, and therefore no status word. */
    makeByProfessional(
      overrides: Overrides<FeaturedNoteContractShape> = {}
    ): FeaturedNoteContractShape {
      return FeaturedNoteContract.StubFactory.make({
        noteId: "tasting-note_2",
        authorName: { source: "canonical", text: "Alexandra Meyer" },
        authorStatus: undefined,
        authorTier: "professional",
        ...overrides
      });
    },

    /**
     * Written in a language the reader did not ask for.
     *
     * The badge case. A note is a member's own words, so a client must say it is
     * showing Afrikaans to somebody who asked for French rather than quietly
     * presenting a fallback as a translation.
     */
    makeInAnotherLanguage(
      overrides: Overrides<FeaturedNoteContractShape> = {}
    ): FeaturedNoteContractShape {
      return FeaturedNoteContract.StubFactory.make({
        text: {
          source: "negotiated",
          text: "Donker vrugte en 'n bietjie rook; nog besig om te sluit.",
          languageTag: "af"
        },
        ...overrides
      });
    }
  }
};
