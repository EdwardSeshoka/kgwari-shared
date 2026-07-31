import type { SearchBrowseGroupContract as SearchBrowseGroupContractShape } from "../search.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * A way into the catalogue, as a consumer receives it.
 *
 * The companion to {@link ../search!SearchResultContract}'s double, and missing
 * until now — which is why the frontend carried a hand-written one that still
 * declared `id` plus `labelKey` and a pre-formatted `count: "312"` long after
 * the contract had collapsed the first two into one closed `key` and made the
 * third a number.
 */

export const SearchBrowseGroupContract = {
  StubFactory: {
    /**
     * The region group, whose labels are proper nouns.
     *
     * `count` is a NUMBER. It was `"312"`, which no client could group per
     * locale — `fr-CH` wants `1 234` where `en` wants `1,234`, and neither can
     * be recovered from a string the server already formatted.
     */
    ...defineStub<SearchBrowseGroupContractShape>({
        key: "region",
        items: [
          {
            id: "stellenbosch",
            label: { source: "canonical", text: "Stellenbosch" },
            count: 1299,
            query: "Stellenbosch"
          },
          {
            id: "swartland",
            label: { source: "canonical", text: "Swartland" },
            count: 188,
            query: "Swartland"
          }
        ]}),

    /**
     * The verdict group — the one whose labels are CHROME, and the case that
     * proves `query` cannot default to the label.
     *
     * The member reads "Inoubliable" while the index holds `Unforgettable`, so
     * the word on screen is not the word to search for. This is also what lets
     * browsing by verdict work in every locale without the index carrying a
     * single translated verdict word.
     */
    makeVerdict(overrides: Overrides<SearchBrowseGroupContractShape> = {}): SearchBrowseGroupContractShape {
      return SearchBrowseGroupContract.StubFactory.make({
        key: "verdict",
        items: [
          {
            id: "unforgettable",
            label: { source: "chrome", key: "Unforgettable" },
            count: 22,
            query: "Unforgettable"
          },
          {
            id: "essential",
            label: { source: "chrome", key: "Essential" },
            count: 24,
            query: "Essential"
          }
        ],
        ...overrides
      });
    },

    /**
     * The country group, whose labels are EXONYMS — "Italia" to an Italian
     * reader, "Italy" to an English one. Negotiated rather than canonical: a
     * country's name is one of the few genuinely translatable catalogue fields,
     * and `languageTag` states which language the server actually landed on.
     */
    makeCountry(overrides: Overrides<SearchBrowseGroupContractShape> = {}): SearchBrowseGroupContractShape {
      return SearchBrowseGroupContract.StubFactory.make({
        key: "country",
        items: [
          {
            id: "za",
            label: { source: "negotiated", text: "South Africa", languageTag: "en" },
            count: 23,
            query: "ZA"
          },
          {
            id: "it",
            label: { source: "negotiated", text: "Italia", languageTag: "it" },
            count: 13,
            query: "IT"
          }
        ],
        ...overrides
      });
    }
  }
};
