import type { WineRecordContract as WineRecordContractShape } from "../record.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { WineClaimContract } from "../../trust/test-doubles/index.js";
import { ClaimantAvailabilityContract } from "./ClaimantAvailabilityContractStub.js";
import { EstateVoiceContract } from "./EstateVoiceContractStub.js";
import { FeaturedNoteContract } from "./FeaturedNoteContractStub.js";
import { LockedSectionContract } from "./LockedSectionContractStub.js";
import { RecordFieldGroupContract } from "./RecordFieldGroupContractStub.js";
import { WineRegisterContract } from "./WineRegisterContractStub.js";
import { WineVerticalEntryContract } from "./WineVerticalEntryContractStub.js";

/**
 * The full detail document for one vintage.
 *
 * ## The three factories are the three claim states, because that is the model
 *
 * Everything that varies with note count lives in `register`; everything that
 * varies with the claim lives in `groups`, `locked` and `availability`. Nothing
 * varies with both, which is what keeps provenance BINARY — and these doubles
 * exist mainly so a consumer can hold all three states rather than the one its
 * fixtures happened to capture.
 *
 *  - `make()` — a COMMUNITY record. Nobody has claimed it. The estate-private
 *    group is present and entirely unanswered, the locked section explains why
 *    in the community's terms, there is no estate voice and no availability, and
 *    the page leads on a member's note instead.
 *  - `makeProducerClaimed()` — the estate has spoken. Estate-private rows are
 *    answered, `locked` is EMPTY, the essay and the seals arrive, and so does a
 *    price.
 *  - `makeDistributorClaimed()` — the asymmetry. Somebody accountable has
 *    arrived, commerce is open, and the estate voice is STILL SHUT with a
 *    different body — a claim on commerce is not a claim on the wine.
 *
 * ## What none of them do
 *
 * A record's facts do not start empty. Estate, region, vintage, varietal,
 * alcohol and closure are matched at ingest and present from the first second,
 * so even the community record carries a full `matched` group. An earlier model
 * framed a matched record as an empty one, which made a one-note page and a
 * fourteen-hundred-note page look like different pages. They are the same page.
 */
export const WineRecordContract = {
  StubFactory: {
    ...defineStub<WineRecordContractShape>({
      wineVintageId: "wine_rubicon-2018",
      groups: [
        RecordFieldGroupContract.StubFactory.make(),
        RecordFieldGroupContract.StubFactory.makeEstatePrivate()
      ],
      locked: [LockedSectionContract.StubFactory.make()],
      register: WineRegisterContract.StubFactory.make(),
      featuredNote: FeaturedNoteContract.StubFactory.make(),
      vertical: [
        WineVerticalEntryContract.StubFactory.make(),
        WineVerticalEntryContract.StubFactory.makeSibling(),
        WineVerticalEntryContract.StubFactory.makeUnjudged()
      ],
      cellarCount: 312,
      inMyCellar: false
    }),

    /** The estate has claimed: the private rows answer, and the essay opens. */
    makeProducerClaimed(
      overrides: Overrides<WineRecordContractShape> = {}
    ): WineRecordContractShape {
      return WineRecordContract.StubFactory.make({
        claimedBy: WineClaimContract.StubFactory.make(),
        groups: [
          RecordFieldGroupContract.StubFactory.make(),
          RecordFieldGroupContract.StubFactory.makeEstateAnswered()
        ],
        locked: [],
        estateVoice: EstateVoiceContract.StubFactory.make(),
        availability: ClaimantAvailabilityContract.StubFactory.make(),
        ...overrides
      });
    },

    /**
     * A distributor has claimed: commerce opens and the wine's own story does
     * not.
     *
     * `locked` is still populated — with the DISTRIBUTOR body, which says
     * something different from the community one. This is the single most
     * important row in this file: a consumer that renders `locked` only when
     * `claimedBy` is absent shows a distributor-claimed record as though the
     * estate had spoken.
     */
    makeDistributorClaimed(
      overrides: Overrides<WineRecordContractShape> = {}
    ): WineRecordContractShape {
      return WineRecordContract.StubFactory.make({
        claimedBy: WineClaimContract.StubFactory.makeDistributor(),
        groups: [
          RecordFieldGroupContract.StubFactory.make(),
          RecordFieldGroupContract.StubFactory.makeEstatePrivate(),
          RecordFieldGroupContract.StubFactory.makeDistributorAnswered()
        ],
        locked: [LockedSectionContract.StubFactory.makeUnderDistributorClaim()],
        estateVoice: undefined,
        availability: ClaimantAvailabilityContract.StubFactory.makeDistributor(),
        ...overrides
      });
    },

    /**
     * A record nobody has written about yet — one note in the room, or none.
     *
     * The SAME page as the dense one, which is the claim worth testing. Only the
     * register is thin; the identity is intact, the groups are full, and there is
     * no featured note because nothing has been saved enough to lead.
     */
    makeUnwrittenAbout(
      overrides: Overrides<WineRecordContractShape> = {}
    ): WineRecordContractShape {
      return WineRecordContract.StubFactory.make({
        register: WineRegisterContract.StubFactory.makeEmpty(),
        featuredNote: undefined,
        vertical: undefined,
        cellarCount: 0,
        ...overrides
      });
    },

    /**
     * Read for a signed-in member who holds a bottle.
     *
     * `inMyCellar` is present ONLY when the record was read for somebody —
     * absent means nobody asked, false means a member asked and does not hold
     * one. A signed-out reader seeing "in your cellar" is what the distinction
     * prevents.
     */
    makeForMember(overrides: Overrides<WineRecordContractShape> = {}): WineRecordContractShape {
      return WineRecordContract.StubFactory.make({ inMyCellar: true, ...overrides });
    },

    /**
     * Read anonymously — `inMyCellar` absent rather than false.
     */
    makeAnonymous(overrides: Overrides<WineRecordContractShape> = {}): WineRecordContractShape {
      return WineRecordContract.StubFactory.make({ inMyCellar: undefined, ...overrides });
    }
  }
};
