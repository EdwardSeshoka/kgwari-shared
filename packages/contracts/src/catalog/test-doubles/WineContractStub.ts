import type { WineContract as WineContractShape } from "../wine.js";

/**
 * Overrides that may explicitly REMOVE a field.
 *
 * `Partial<T>` is not enough under `exactOptionalPropertyTypes`: it permits
 * omitting a key but not passing `undefined` for one. The interesting tests are
 * precisely the ones that take something away, so the doubles have to be able
 * to say so.
 */
type Overrides = { [K in keyof WineContractShape]?: WineContractShape[K] | undefined };

/**
 * A wine as it travels on the wire.
 *
 * **Annotated as `WineContractShape`, never inferred** — that is the whole point of
 * shipping this from the same package as the contract. A field added to or
 * removed from `WineContractShape` breaks this file immediately, and every consumer
 * importing it, rather than letting a hand-written local copy drift quietly. A
 * frontend `WineCollectionDTO` spent this session expecting `title` and
 * `description` that the contract had stopped sending, and its tests stayed
 * green throughout.
 *
 * `make()` returns the FULLY POPULATED case on purpose: the interesting tests
 * take something away (`{ price: undefined }`), and a sparse default would make
 * every one of those read as "still absent" rather than "removed".
 */
export const WineContract = {
  StubFactory: {
    make(overrides: Overrides = {}): WineContractShape {
      return {
        id: "rubicon-2018",
        wineLabelId: "rubicon",
        name: "Rubicon",
        estate: "Meerlust Estate",
        producerId: "estate_meerlust",
        vintage: 2018,
        countryCode: "ZA",
        region: "Stellenbosch",
        regionId: "region_stellenbosch",
        location: { area: "Stellenbosch" },
        imageUrl: "https://images.example.com/rubicon-2018.jpg",
        description: "A Bordeaux-style blend from the Cape.",
        price: { amountMinorUnits: 89500, currency: "ZAR" },
        isFeatured: true,
        verdict: "Essential",
        ...overrides
      } as WineContractShape;
    },

    /** Champagne and most fortifieds are blended across years by design. */
    makeNonVintage(overrides: Overrides = {}): WineContractShape {
      return WineContract.StubFactory.make({
        id: "brut-reserve-nv",
        name: "Brut Réserve",
        vintage: undefined,
        vintageDisplay: "NV",
        ...overrides
      });
    },

    /** Most of the catalogue is not for sale — absence is the common case. */
    makeUnlisted(overrides: Overrides = {}): WineContractShape {
      return WineContract.StubFactory.make({ price: undefined, ...overrides });
    },

    /**
     * No vintage AND no non-vintage marker — the vintage is simply unrecorded.
     * A different fact from {@link makeNonVintage}, and conflating the two is
     * what made six seeded rows claim a Bordeaux château was non-vintage.
     */
    makeVintageUnknown(overrides: Overrides = {}): WineContractShape {
      return WineContract.StubFactory.make({
        vintage: undefined,
        vintageDisplay: undefined,
        ...overrides
      });
    }
  }
};
