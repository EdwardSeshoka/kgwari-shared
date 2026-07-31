import type { TastingNoteContract as TastingNoteContractShape } from "../tastingNote.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * What a member wrote about a wine they drank.
 *
 * Keyed on `wineVintageId`: a note is about a specific harvest, not about the
 * label in general, and collapsing the two is how a 2018 note ends up under a
 * 2019 bottle.
 *
 * `note` and `createdAt` are REQUIRED, and this stub was missing both. A
 * `... } as TastingNoteContractShape` sat where the check should have been and
 * reported nothing; the gap surfaced the moment that cast was replaced by
 * {@link defineStub}, which takes the literal as a parameter and therefore checks
 * it. This file is the reason that change was worth making.
 */
export const TastingNoteContract = {
  StubFactory: {
    ...defineStub<TastingNoteContractShape>({
      id: "tasting-note_1",
      wineVintageId: "wine_kanonkop-pinotage-2019",
      user: { id: "user_thandi-mokoena", displayName: "Thandi Mokoena", initials: "TM" },
      verdict: "Essential",
      note: "Dark fruit and a little smoke; still tightening rather than fading.",
      createdAt: "2026-06-23T10:15:30.000Z"
    }),

    /**
     * A note with words but no verdict.
     *
     * A real state, not a degenerate one: a member can write about a wine without
     * ranking it, and a reader that assumes a verdict is present renders an empty
     * tier where there should be nothing at all.
     */
    makeWithoutVerdict(
      overrides: Overrides<TastingNoteContractShape> = {}
    ): TastingNoteContractShape {
      return TastingNoteContract.StubFactory.make({ verdict: undefined, ...overrides });
    }
  }
};
