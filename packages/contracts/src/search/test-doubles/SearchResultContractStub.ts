import type { SearchResultContract as SearchResultContractShape } from "../search.js";

/**
 * One row of the unified ledger, as a consumer receives it.
 *
 * The shape the backend's projector tests assert against and the frontend's
 * search doubles return. Shipping it from here means a contract change breaks
 * both immediately, rather than each holding a copy that quietly stops matching.
 */

/** Overrides that may explicitly REMOVE a field — `Partial<T>` cannot, under
 * `exactOptionalPropertyTypes`, and removing is what the interesting tests do. */
type Overrides = { [K in keyof SearchResultContractShape]?: SearchResultContractShape[K] | undefined };

export const SearchResultContract = {
  StubFactory: {
    make(overrides: Overrides = {}): SearchResultContractShape {
      return {
        id: "search_wine_rubicon-2018",
        kind: "WINE",
        facet: "wines",
        entityId: "rubicon-2018",
        title: { source: "canonical", text: "Rubicon" },
        eyebrow: { source: "canonical", text: "Meerlust Estate" },
        meta: { kind: "vintage", year: 2018 },
        verdict: "Essential",
        listedPrice: { amountMinorUnits: 89500, currency: "ZAR" },
        ...overrides
      } as SearchResultContractShape;
    },

    /** A person row: the one kind whose eyebrow is a CHROME KEY, not a word. */
    makePerson(overrides: Overrides = {}): SearchResultContractShape {
      return SearchResultContract.StubFactory.make({
        id: "search_person_user_alexandra-meyer",
        kind: "PERSON",
        facet: "people",
        entityId: "user_alexandra-meyer",
        title: { source: "canonical", text: "Alexandra Meyer" },
        eyebrow: { source: "chrome", key: "enthusiast" },
        meta: { kind: "noteCount", count: 241 },
        verdict: undefined,
        listedPrice: undefined,
        ...overrides
      });
    }
  }
};
