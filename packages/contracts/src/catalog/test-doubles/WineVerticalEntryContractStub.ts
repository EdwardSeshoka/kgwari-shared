import type { WineVerticalEntryContract as WineVerticalEntryContractShape } from "../record.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * One vintage in the vertical — the same label across years, each with its own
 * verdict and its own weight.
 *
 * `vintage` is an ORDINAL. Interpolate it as plain digits and never through a
 * grouping formatter, which renders 2018 as "2 018" in French.
 *
 * `makeUnjudged()` is the row a consumer drops. A vintage with notes but no
 * verdict is a real and common state — the room has written about it without
 * settling on a word — and a vertical that hides it has a hole in the middle of
 * a run of years, which reads as a wine that was not made.
 */
export const WineVerticalEntryContract = {
  StubFactory: {
    ...defineStub<WineVerticalEntryContractShape>({
      wineVintageId: "wine_rubicon-2018",
      vintage: 2018,
      verdict: "Essential",
      noteCount: 1480,
      note: {
        source: "negotiated",
        text: "The one the estate will be judged on.",
        languageTag: "en"
      },
      isCurrent: true
    }),

    /** Another year in the same run — not the one being viewed. */
    makeSibling(
      overrides: Overrides<WineVerticalEntryContractShape> = {}
    ): WineVerticalEntryContractShape {
      return WineVerticalEntryContract.StubFactory.make({
        wineVintageId: "wine_rubicon-2019",
        vintage: 2019,
        verdict: "Worth Revisiting",
        noteCount: 402,
        isCurrent: undefined,
        ...overrides
      });
    },

    /** Written about, never settled on. A gap in the verdict, not in the years. */
    makeUnjudged(
      overrides: Overrides<WineVerticalEntryContractShape> = {}
    ): WineVerticalEntryContractShape {
      return WineVerticalEntryContract.StubFactory.make({
        wineVintageId: "wine_rubicon-2020",
        vintage: 2020,
        verdict: undefined,
        noteCount: 11,
        note: undefined,
        isCurrent: undefined,
        ...overrides
      });
    }
  }
};
