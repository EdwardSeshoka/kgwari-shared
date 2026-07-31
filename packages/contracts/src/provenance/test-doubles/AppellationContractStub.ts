import type { AppellationContract as AppellationContractShape } from "../appellation.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * A demarcated origin.
 *
 * `system` is the scheme the COUNTRY uses — WO in South Africa, AOC in France —
 * and it travels rather than being derived at the reader, so a client does not
 * carry a country→system table that goes stale.
 */

export const AppellationContract = {
  StubFactory: {
    ...defineStub<AppellationContractShape>({
        id: "appellation_simonsberg-stellenbosch",
        name: "Simonsberg-Stellenbosch",
        countryCode: "ZA",
        regionId: "region_stellenbosch",
        system: "WO"}),

    /** A nested appellation, and a non-WO system — the French case. */
    makeNested(overrides: Overrides<AppellationContractShape> = {}): AppellationContractShape {
      return AppellationContract.StubFactory.make({
        id: "appellation_pauillac",
        name: "Pauillac",
        countryCode: "FR",
        regionId: "region_bordeaux",
        system: "AOC",
        parentAppellationId: "appellation_medoc",
        ...overrides
      });
    }
  }
};
