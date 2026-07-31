import type { RegionContract as RegionContractShape } from "../region.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * A place wine comes from.
 *
 * `producerCount` and `wineCount` are NUMBERS and required. They were the sort of
 * field that arrives pre-formatted — "312" — which no reader can group per locale,
 * because `fr-CH` writes `1 234` where `en` writes `1,234` and neither survives a
 * round trip through a string the server already decided.
 */

export const RegionContract = {
  StubFactory: {
    ...defineStub<RegionContractShape>({
        id: "region_stellenbosch",
        name: "Stellenbosch",
        country: "South Africa",
        countryCode: "ZA",
        regionType: "region",
        producerCount: 38,
        wineCount: 1299}),

    /**
     * A region whose name genuinely differs by language — "Italia" to an Italian
     * reader, "Italy" to an English one.
     *
     * `exonym` marks it, and `nameLanguage` states which language the server
     * actually landed on. One of the few catalogue fields that is legitimately
     * translatable, as against a producer's name, which never is.
     */
    makeExonymous(overrides: Overrides<RegionContractShape> = {}): RegionContractShape {
      return RegionContract.StubFactory.make({
        id: "region_toscana",
        name: "Toscana",
        country: "Italy",
        countryCode: "IT",
        exonym: true,
        nameLanguage: "it",
        ...overrides
      });
    }
  }
};
