import type { CellarEntryContract as CellarEntryContractShape } from "../cellar.js";

/**
 * Overrides that may explicitly REMOVE a field.
 *
 * `Partial<T>` is not enough under `exactOptionalPropertyTypes`: it permits
 * omitting a key but not passing `undefined` for one. The interesting tests are
 * precisely the ones that take something away, so the doubles have to be able to
 * say so.
 */
type Overrides = {
  [K in keyof CellarEntryContractShape]?: CellarEntryContractShape[K] | undefined;
};

/**
 * A holding's member-owned facts.
 *
 * **Annotated as `CellarEntryContractShape`, never inferred** — a field added to
 * or removed from the contract breaks this file immediately, and every consumer
 * importing it, rather than letting a hand-written local copy drift quietly.
 *
 * `make()` returns the fully populated case on purpose: the interesting tests
 * take something away (`{ paidPrice: undefined }`), and a sparse default would
 * make every one of those read as "still absent" rather than "removed".
 */
export const CellarEntryContract = {
  StubFactory: {
    make(overrides: Overrides = {}): CellarEntryContractShape {
      return {
        wineId: "rubicon-2018",
        bottles: 6,
        paidPrice: {
          amountMinorUnits: 79900,
          currency: "ZAR",
          asOf: "2025-03-01T00:00:00.000Z"
        },
        acquiredAt: "2025-03-01T00:00:00.000Z",
        note: "Last two bottles — saving them.",
        noteLanguage: "en",
        ...overrides
      };
    },

    /**
     * Bought en primeur: paid on release, delivered three years later.
     *
     * The case that proves `acquiredAt` and `paidPrice.asOf` are two facts. A
     * stub where they always match would let a consumer collapse them and stay
     * green.
     */
    makeEnPrimeur(overrides: Overrides = {}): CellarEntryContractShape {
      return CellarEntryContract.StubFactory.make({
        paidPrice: {
          amountMinorUnits: 210000,
          currency: "EUR",
          asOf: "2022-06-01T00:00:00.000Z"
        },
        acquiredAt: "2025-09-15T00:00:00.000Z",
        ...overrides
      });
    },

    /** A gift: acquired on a date, never paid for. */
    makeGifted(overrides: Overrides = {}): CellarEntryContractShape {
      return CellarEntryContract.StubFactory.make({
        paidPrice: undefined,
        note: "A gift from Thandi.",
        ...overrides
      });
    },

    /**
     * Drunk, but kept on record.
     *
     * Zero bottles is a holding, not an absent one — a client that treats it as
     * "remove the row" erases how a member remembers having owned the wine.
     */
    makeDrunk(overrides: Overrides = {}): CellarEntryContractShape {
      return CellarEntryContract.StubFactory.make({ bottles: 0, ...overrides });
    }
  }
};
