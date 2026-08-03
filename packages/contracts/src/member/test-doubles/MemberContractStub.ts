import type { MemberContract as MemberContractShape } from "../profile.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * A member profile as it travels on the wire.
 *
 * The shape the backend's `GET /members/me` tests assert against and the
 * frontend's member doubles return. Shipping it from here means a contract
 * change breaks both immediately, rather than each holding a copy that quietly
 * stops matching.
 *
 * This one has already earned its keep once in the negative: the frontend held a
 * hand-written version, and when {@link MemberContractShape.noteCount} became
 * required in 6.0.0 nothing pointed at the stub — the gap only surfaced when the
 * frontend upgraded, two majors later.
 */

export const MemberContract = {
  StubFactory: {
    /**
     * An onboarded enthusiast — the overwhelmingly common case, and the one with
     * no trust mark. Every nullable field is explicitly `null` rather than
     * omitted, because `null` is what the wire actually carries and a test that
     * asserts on absence should be taking something away, not finding it missing.
     */
    ...defineStub<MemberContractShape>({
        userId: "user_alexandra-meyer",
        name: "Alexandra Meyer",
        profileType: "enthusiast",
        contactMethod: "email",
        contactValue: "alexandra@example.com",
        tasteNote: null,
        professionalRole: null,
        organization: null,
        organizationPlaceId: null,
        businessName: null,
        businessPlaceId: null,
        address: null,
        addressPlaceId: null,
        latitude: null,
        longitude: null,
        region: null,
        country: null,
        onboardingCompleted: true,
        createdAt: "2026-06-23T10:15:30.000Z",
        noteCount: 241,
        avatar: null}),

    /**
     * A verified business account: an estate, which earns the producer crest.
     *
     * The business fields are populated together on purpose — a persona without
     * a `businessName` is a state onboarding does not produce, and a double that
     * models it invites code that handles a case which cannot occur.
     */
    makeEstate(overrides: Overrides<MemberContractShape> = {}): MemberContractShape {
      return MemberContract.StubFactory.make({
        userId: "user_meerlust",
        name: "Chris Williams",
        profileType: "estate",
        professionalRole: "Cellarmaster",
        organization: "Meerlust Estate",
        businessName: "Meerlust Estate",
        businessPlaceId: "place_meerlust",
        address: "Baden Powell Dr, Stellenbosch",
        addressPlaceId: "place_meerlust_address",
        latitude: -33.9847,
        longitude: 18.7573,
        region: "Stellenbosch",
        country: "ZA",
        ...overrides
      });
    },

    /**
     * Signed up, nothing filled in yet.
     *
     * `noteCount` is 0 and NOT absent: a member who has written nothing has
     * written nothing, which is a true statement rather than missing data.
     */
    makeOnboarding(overrides: Overrides<MemberContractShape> = {}): MemberContractShape {
      return MemberContract.StubFactory.make({
        userId: "user_new",
        name: "",
        onboardingCompleted: false,
        noteCount: 0,
        ...overrides
      });
    },

    /**
     * A member the Profile page has something to show: a picture, and both
     * per-kind counters.
     *
     * The 70:1 ratio is deliberate and is the reason the counters are per kind
     * rather than one total — a heading that read "Writing (1,433)" would be a
     * number about notes wearing a label about writing, and the filter chips
     * exist to pull them apart.
     *
     * The default above leaves `storyCount` and `tastingsAttendedCount` ABSENT,
     * which is the honest state for a record written before those fields existed:
     * absent means unknown, and 0 would state something nobody checked. A
     * consumer that renders `storyCount ?? 0` as "0 stories" has turned one into
     * the other.
     */
    makeWriter(overrides: Overrides<MemberContractShape> = {}): MemberContractShape {
      return MemberContract.StubFactory.make({
        userId: "user_thandi-mokoena",
        name: "Thandi Mokoena",
        profileType: "collector",
        avatar: {
          url: "https://images.kgwari.test/members/thandi-mokoena.jpg",
          alt: {
            source: "negotiated",
            text: "Thandi Mokoena, in a cellar doorway.",
            languageTag: "en"
          },
          width: 512,
          height: 512
        },
        noteCount: 1412,
        storyCount: 21,
        tastingsAttendedCount: 26,
        ...overrides
      });
    }
  }
};
