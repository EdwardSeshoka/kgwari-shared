import type { TastingNoteContract as TastingNoteContractShape } from "../tastingNote.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { NoteReadingsContract } from "./NoteReadingsContractStub.js";

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
    },

    /**
     * A note that answered the structured questions too — and the default does
     * NOT, deliberately.
     *
     * Prose plus a verdict is a complete note; the readings are offered and most
     * members skip most of them. A base stub carrying a full readings block would
     * teach consumers that `readings` is always there, which is the assumption
     * that breaks on the majority of real rows.
     *
     * Composed from the published readings double rather than a literal, so a
     * field that moves in one breaks both.
     */
    makeWithReadings(
      overrides: Overrides<TastingNoteContractShape> = {}
    ): TastingNoteContractShape {
      return TastingNoteContract.StubFactory.make({
        readings: NoteReadingsContract.StubFactory.make(),
        photo: {
          url: "https://images.kgwari.test/notes/tasting-note_1.jpg",
          width: 1600,
          height: 1200
        },
        ...overrides
      });
    },

    /**
     * A note kept out of the room.
     *
     * The observation still counts — a private note is a genuine reading and the
     * register aggregates it. What visibility governs is whose name and words
     * appear. A consumer that filters private notes out of an aggregate has
     * read this field as though it meant "not real".
     */
    makePrivate(
      overrides: Overrides<TastingNoteContractShape> = {}
    ): TastingNoteContractShape {
      return TastingNoteContract.StubFactory.make({
        visibility: "private",
        saveCount: undefined,
        ...overrides
      });
    }
  }
};
