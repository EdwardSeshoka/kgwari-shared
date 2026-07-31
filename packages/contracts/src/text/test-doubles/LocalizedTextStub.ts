import type {
  CanonicalText as CanonicalTextShape,
  ChromeText as ChromeTextShape,
  NegotiatedText as NegotiatedTextShape
} from "../text.js";

/**
 * The three ways a piece of text can travel.
 *
 * Not `*Contract` types — these are the CARRIERS every other contract is built
 * from, which is exactly why they earn doubles. The rule they encode is that a
 * label must always declare its source, and each source has a different obligation
 * on the reader:
 *
 *   canonical   a proper noun. Passes through untouched — "Meerlust Estate" is
 *               the same word in Cape Town and in Quebec.
 *   chrome      a closed vocabulary. The KEY travels and is what the index holds;
 *               the reader renders the word in the member's language. This is what
 *               lets browsing by verdict work in every locale without a single
 *               translated verdict word in the index.
 *   negotiated  server-localised prose, carrying the language it actually landed
 *               on. When `languageTag` is not what was asked for, a reader badges
 *               the field rather than passing a fallback off as a translation.
 */

export const CanonicalText = {
  StubFactory: {
    make(text = "Meerlust Estate"): CanonicalTextShape {
      return { source: "canonical", text };
    }
  }
};

export const ChromeText = {
  StubFactory: {
    /** A verdict key: the index holds `Unforgettable`, the member reads their own word. */
    make(key = "Unforgettable"): ChromeTextShape {
      return { source: "chrome", key };
    }
  }
};

export const NegotiatedText = {
  StubFactory: {
    make(text = "Un cabernet d'une grande tenue.", languageTag = "fr"): NegotiatedTextShape {
      return { source: "negotiated", text, languageTag };
    },

    /**
     * The case a reader must BADGE: the server could not serve the language that
     * was asked for and answered in another.
     *
     * It matters most on an estate's own essay and a member's own note, where
     * quietly showing English misrepresents whose words they are.
     */
    makeUntranslated(text = "A cabernet of real endurance."): NegotiatedTextShape {
      return { source: "negotiated", text, languageTag: "en" };
    }
  }
};
