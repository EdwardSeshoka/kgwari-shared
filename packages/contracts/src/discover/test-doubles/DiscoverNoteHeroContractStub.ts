import type { DiscoverNoteHeroContract as DiscoverNoteHeroContractShape } from "../noteHero.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { TastingNoteContract } from "../../social/test-doubles/index.js";

/**
 * The home hero, when what it features is a member's note.
 *
 * Composed from the published note double rather than a flattened copy, for the
 * reason the wine hero is composed from the wine double: the words, the byline
 * and the verdict a hero shows must be the same values the note row would
 * render, and cannot disagree with them.
 *
 * `makeUnsaved()` is the case a client gets wrong. A note leads the page because
 * members saved it, so `saveCount` is nearly always there — which is exactly why
 * a reader that renders it unconditionally survives every test until the first
 * editorially-chosen lede.
 */
export const DiscoverNoteHeroContract = {
  StubFactory: {
    ...defineStub<DiscoverNoteHeroContractShape>({
      kind: "note",
      feature: { eyebrow: "From the room", label: "Tonight", volume: 47 },
      note: TastingNoteContract.StubFactory.make({ saveCount: 214 })
    }),

    /** Chosen by an editor rather than by the room — no save count to lead on. */
    makeUnsaved(
      overrides: Overrides<DiscoverNoteHeroContractShape> = {}
    ): DiscoverNoteHeroContractShape {
      return DiscoverNoteHeroContract.StubFactory.make({
        note: TastingNoteContract.StubFactory.make({ saveCount: undefined }),
        ...overrides
      });
    }
  }
};
