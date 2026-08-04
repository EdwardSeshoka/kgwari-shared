import type { ContributionContract as ContributionContractShape } from "../contribution.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { CollectionContract } from "../../collections/test-doubles/index.js";

/**
 * One row of the corpus.
 *
 * A factory per kind, and a consumer that only ever sees notes is a consumer
 * whose `switch` has an untested default. The interleave is the reason this
 * contract exists, so the doubles have to be able to build one: a stream test
 * composes every kind and overrides `createdAt` to put them in a deliberate
 * order. The ledger is cut to carry all of them, and a fixture exercising one
 * branch ships the rest untested.
 *
 * Each variant gets its OWN `defineStub` rather than one factory with a `kind`
 * override, and that is not ceremony. `Overrides<ContributionContract>` over a
 * discriminated union cannot express "this kind, therefore this payload" — it
 * would happily accept `kind: "editorial"` beside a `note`, which is the one
 * shape the union exists to forbid. Narrowing first means each literal is
 * checked against the variant it claims to be.
 */
type NoteContribution = Extract<ContributionContractShape, { kind: "note" }>;
type EditorialContribution = Extract<ContributionContractShape, { kind: "editorial" }>;
type TastingContribution = Extract<ContributionContractShape, { kind: "tasting" }>;
type CollectionContribution = Extract<ContributionContractShape, { kind: "collection" }>;

const noteStub = defineStub<NoteContribution>({
  id: "contribution_1",
  kind: "note",
  createdAt: "2026-06-23T10:15:30.000Z",
  author: { id: "user_thandi-mokoena", displayName: "Thandi Mokoena", initials: "TM" },
  saveCount: 12,
  note: {
    id: "tasting-note_1",
    wineVintageId: "wine_kanonkop-pinotage-2019",
    user: { id: "user_thandi-mokoena", displayName: "Thandi Mokoena", initials: "TM" },
    verdict: "Essential",
    note: "Dark fruit and a little smoke; still tightening rather than fading.",
    createdAt: "2026-06-23T10:15:30.000Z"
  }
});

const editorialStub = defineStub<EditorialContribution>({
  id: "contribution_2",
  kind: "editorial",
  createdAt: "2026-06-23T09:02:00.000Z",
  author: { id: "user_thandi-mokoena", displayName: "Thandi Mokoena", initials: "TM" },
  saveCount: 41,
  editorial: {
    id: "editorial_fourteen-clones",
    contentType: "story",
    title: "Fourteen clones, one rootstock",
    description: "What a decade of replanting did to a hillside in Stellenbosch.",
    publishedAt: "2026-06-23T09:02:00.000Z"
  }
});

const tastingStub = defineStub<TastingContribution>({
  id: "contribution_3",
  kind: "tasting",
  createdAt: "2026-06-22T18:30:00.000Z",
  author: { id: "user_thandi-mokoena", displayName: "Thandi Mokoena", initials: "TM" },
  event: {
    id: "event_kanonkop-vertical",
    title: "Kanonkop vertical",
    eventType: "tasting",
    startDateTime: "2026-06-22T17:00:00.000Z",
    lifecycle: "past"
  }
});

const collectionStub = defineStub<CollectionContribution>({
  id: "contribution_4",
  kind: "collection",
  createdAt: "2026-06-21T11:20:00.000Z",
  author: { id: "user_thandi-mokoena", displayName: "Thandi Mokoena", initials: "TM" },
  saveCount: 63,
  collection: CollectionContract.StubFactory.make()
});

export const ContributionContract = {
  StubFactory: {
    ...noteStub,

    /** A story filed by a member — the 1-in-70 row in a Writing stream. */
    makeEditorial(overrides: Overrides<EditorialContribution> = {}): EditorialContribution {
      return editorialStub.make(overrides);
    },

    /**
     * A tasting the member attended.
     *
     * The kind with no other wire shape at all — attendance existed as a fact
     * about an evening and nowhere as data, so this double is the first place a
     * consumer can hold one. Note the absent `saveCount`: you save a piece of
     * writing, not your own attendance.
     */
    makeTasting(overrides: Overrides<TastingContribution> = {}): TastingContribution {
      return tastingStub.make(overrides);
    },

    /**
     * A list somebody published.
     *
     * The row's mark reads `collection.kind` — shelf here, itinerary or
     * selection elsewhere — and never the word "collection", which is the
     * abstract base type and would leak first in a ledger, because a ledger is
     * where every kind meets.
     */
    makeCollection(overrides: Overrides<CollectionContribution> = {}): CollectionContribution {
      return collectionStub.make(overrides);
    },

    /**
     * The house's own list, in the stream beside everyone else's.
     *
     * Kgwari is a LENS and not a band: a Selection sorts by date among the
     * members' and the sommeliers' lists, and the byline — a name and no mark —
     * does the only distinguishing there is.
     */
    makeHouseCollection(
      overrides: Overrides<CollectionContribution> = {}
    ): CollectionContribution {
      return collectionStub.make({
        id: "contribution_5",
        author: { id: "user_kgwari", displayName: "Kgwari" },
        collection: CollectionContract.StubFactory.makeSelection(),
        ...overrides
      });
    }
  }
};
