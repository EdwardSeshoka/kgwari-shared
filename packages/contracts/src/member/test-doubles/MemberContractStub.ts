import type { MemberContract as MemberContractShape } from "../profile.js";

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

/** Overrides that may explicitly REMOVE a field — `Partial<T>` cannot, under
 * `exactOptionalPropertyTypes`, and removing is what the interesting tests do. */
type Overrides = { [K in keyof MemberContractShape]?: MemberContractShape[K] | undefined };

export const MemberContract = {
  StubFactory: {
    /**
     * An onboarded enthusiast — the overwhelmingly common case, and the one with
     * no trust mark. Every nullable field is explicitly `null` rather than
     * omitted, because `null` is what the wire actually carries and a test that
     * asserts on absence should be taking something away, not finding it missing.
     */
    make(overrides: Overrides = {}): MemberContractShape {
      return {
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
        ...overrides
      } as MemberContractShape;
    },

    /**
     * A verified business account: an estate, which earns the producer crest.
     *
     * The business fields are populated together on purpose — a persona without
     * a `businessName` is a state onboarding does not produce, and a double that
     * models it invites code that handles a case which cannot occur.
     */
    makeEstate(overrides: Overrides = {}): MemberContractShape {
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
    makeOnboarding(overrides: Overrides = {}): MemberContractShape {
      return MemberContract.StubFactory.make({
        userId: "user_new",
        name: "",
        onboardingCompleted: false,
        noteCount: 0,
        ...overrides
      });
    }
  }
};
