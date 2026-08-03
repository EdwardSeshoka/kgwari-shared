import type { MediaRefContract as MediaRefContractShape } from "../media.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * A member's photo of a bottle on a table.
 *
 * `make()` is the described case, because described is what an image SHOULD be
 * and a default that models the lazy path teaches the lazy path.
 * `makeUndescribed()` is the one that matters in tests: a photo with no alt text
 * is what most uploads actually are, and a client that renders `alt.text`
 * without checking crashes on exactly that row.
 */
export const MediaRefContract = {
  StubFactory: {
    ...defineStub<MediaRefContractShape>({
      url: "https://images.kgwari.test/notes/note_1.jpg",
      alt: {
        source: "negotiated",
        text: "A half-poured glass beside the bottle, evening light.",
        languageTag: "en"
      },
      width: 1600,
      height: 1200
    }),

    /** Uploaded without a description — decorative, and the client must say so. */
    makeUndescribed(overrides: Overrides<MediaRefContractShape> = {}): MediaRefContractShape {
      return MediaRefContract.StubFactory.make({ alt: undefined, ...overrides });
    },

    /**
     * A url with no dimensions — the legacy shape, and the reflow case. A client
     * that assumes `width` reserves a box of `NaN` pixels.
     */
    makeWithoutDimensions(overrides: Overrides<MediaRefContractShape> = {}): MediaRefContractShape {
      return MediaRefContract.StubFactory.make({
        width: undefined,
        height: undefined,
        ...overrides
      });
    }
  }
};
