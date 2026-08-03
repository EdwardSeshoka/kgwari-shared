import type { CellarTonightRowContract as CellarTonightRowContractShape } from "../cellarTonightRow.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * A bottle of the member's that the room is opening tonight.
 *
 * `activityCount` is WINDOWED and a lifetime count is the mistake this double
 * exists to catch: 3 here beside a `noteCount` of 1,480 on the same wine is not
 * a contradiction, it is the whole point of the row. A consumer that renders
 * either number in the other's sentence says something false.
 */
export const CellarTonightRowContract = {
  StubFactory: {
    ...defineStub<CellarTonightRowContractShape>({
      wine: {
        id: "wine_kanonkop-pinotage-2019",
        wineLabelId: "kanonkop-pinotage",
        name: "Pinotage",
        producerName: "Kanonkop",
        vintage: 2019,
        vintageDisplay: "2019"
      },
      activityCount: 3,
      bottlesHeld: 2
    }),

    /**
     * A wine the room is opening that the member no longer holds a bottle of.
     *
     * Still their row — a cellar keeps wines drunk but remembered, which is why
     * `CellarEntryContract.bottles` treats 0 as a real holding. A client that
     * requires `bottlesHeld` to render drops exactly these.
     */
    makeWithoutBottles(
      overrides: Overrides<CellarTonightRowContractShape> = {}
    ): CellarTonightRowContractShape {
      return CellarTonightRowContract.StubFactory.make({
        bottlesHeld: undefined,
        ...overrides
      });
    }
  }
};
