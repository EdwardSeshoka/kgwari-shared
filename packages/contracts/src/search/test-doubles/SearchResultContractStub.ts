import type { SearchResultContract as SearchResultContractShape } from "../search.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * One row of the unified ledger, as a consumer receives it.
 *
 * The shape the backend's projector tests assert against and the frontend's
 * search doubles return. Shipping it from here means a contract change breaks
 * both immediately, rather than each holding a copy that quietly stops matching.
 */

export const SearchResultContract = {
  StubFactory: {
    ...defineStub<SearchResultContractShape>({
        id: "search_wine_rubicon-2018",
        kind: "WINE",
        facet: "wines",
        entityId: "rubicon-2018",
        title: { source: "canonical", text: "Rubicon" },
        eyebrow: { source: "canonical", text: "Meerlust Estate" },
        meta: { kind: "vintage", year: 2018 },
        verdict: "Essential",
        listedPrice: { amountMinorUnits: 89500, currency: "ZAR" }}),

    /** A person row: the one kind whose eyebrow is a CHROME KEY, not a word. */
    makePerson(overrides: Overrides<SearchResultContractShape> = {}): SearchResultContractShape {
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
    },

    /**
     * An estate row — the producer itself rather than one of its wines.
     *
     * Its `meta` is the composed-from-DATA case: `foundedYear` and `wineCount`
     * travel as numbers so each client renders "Est. 1693 · 6 wines" in its own
     * word order. The founding YEAR is an ordinal and reaches the screen as plain
     * digits; only the count is grouped.
     */
    makeEstate(overrides: Overrides<SearchResultContractShape> = {}): SearchResultContractShape {
      return SearchResultContract.StubFactory.make({
        id: "search_estate_meerlust",
        kind: "ESTATE",
        facet: "estates",
        entityId: "estate_meerlust",
        title: { source: "canonical", text: "Meerlust Estate" },
        eyebrow: { source: "canonical", text: "Stellenbosch" },
        meta: { kind: "estate", foundedYear: 1693, wineCount: 6 },
        verdict: undefined,
        listedPrice: undefined,
        ...overrides
      });
    },

    /**
     * A row carrying the review picker's FIFTH verdict word.
     *
     * Legal on the wire and outside the four tiers a ledger renders, so a reader
     * must narrow it to "no verdict" rather than show a fifth type identity. The
     * narrowing is client behaviour, but the ROW is a shape the wire really sends
     * — which is why the double belongs here rather than in each client. It lived
     * in the frontend until now, so only one reader was ever tested against it.
     */
    makeWithUnrenderableVerdict(overrides: Overrides<SearchResultContractShape> = {}): SearchResultContractShape {
      return SearchResultContract.StubFactory.make({
        verdict: "Not One I'd Revisit",
        ...overrides
      });
    },

    /**
     * A row whose `kind` this reader does not know.
     *
     * The forward-compatibility case: the index gains an entity type before a
     * client release can render it, and the client must DROP the row rather than
     * fail on it. Cast because the value is deliberately outside today's union —
     * that is the whole scenario, and a stub unable to express it would leave the
     * drop-unknown-kinds rule untested in every reader at once.
     */
    makeUnknownKind(overrides: Overrides<SearchResultContractShape> = {}): SearchResultContractShape {
      return SearchResultContract.StubFactory.make({
        id: "search_unknown",
        kind: "MERCHANT" as SearchResultContractShape["kind"],
        facet: "merchants" as SearchResultContractShape["facet"],
        ...overrides
      });
    }
  }
};
