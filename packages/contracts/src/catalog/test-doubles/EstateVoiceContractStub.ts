import type { EstateVoiceContract as EstateVoiceContractShape } from "../record.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { EstateSealContract } from "./EstateSealContractStub.js";

/**
 * The estate's own account of its own wine. Present only under a PRODUCER
 * claim — a distributor claim never opens it.
 *
 * All prose, and the one place on the record where `languageTag` really earns
 * its keep: these are the estate's own words, so serving an English fallback to
 * an Afrikaans member without saying so misrepresents whose words they are
 * reading and in what language they were written. Every factory here therefore
 * carries a language tag on every field, and `makeTranslated()` exists to model
 * the case a client must badge rather than pass off as original.
 */
export const EstateVoiceContract = {
  StubFactory: {
    ...defineStub<EstateVoiceContractShape>({
      headline: {
        source: "negotiated",
        text: "The block we nearly gave up on.",
        languageTag: "en"
      },
      standfirst: {
        source: "negotiated",
        text: "Fourteen years after the replant, the hillside finally answers.",
        languageTag: "en"
      },
      essay: [
        {
          source: "negotiated",
          text: "We pulled it out in 2011 and argued about what should go back in for two seasons.",
          languageTag: "en"
        },
        {
          source: "negotiated",
          text: "The answer was not the one the nursery recommended, and it took a decade to prove.",
          languageTag: "en"
        }
      ],
      bylineName: { source: "canonical", text: "Chris Williams" },
      bylineRoleKey: "role.cellarmaster",
      quote: {
        source: "negotiated",
        text: "You do not taste a rootstock. You taste what it let the vine do.",
        languageTag: "en"
      },
      seals: [
        EstateSealContract.StubFactory.make(),
        EstateSealContract.StubFactory.makeUnaudited()
      ]
    }),

    /**
     * Written in Afrikaans and served to an Afrikaans reader — no fallback, no
     * badge. The case that proves `languageTag` is about the TEXT rather than
     * about the request.
     */
    makeAfrikaans(overrides: Overrides<EstateVoiceContractShape> = {}): EstateVoiceContractShape {
      return EstateVoiceContract.StubFactory.make({
        headline: {
          source: "negotiated",
          text: "Die blok wat ons byna prysgegee het.",
          languageTag: "af"
        },
        standfirst: {
          source: "negotiated",
          text: "Veertien jaar ná die heraanplant antwoord die heuwel uiteindelik.",
          languageTag: "af"
        },
        essay: [
          {
            source: "negotiated",
            text: "Ons het dit in 2011 uitgehaal en twee seisoene lank gestry oor wat moet terugkom.",
            languageTag: "af"
          }
        ],
        quote: undefined,
        ...overrides
      });
    },

    /**
     * A record with no seals — the common case, and the one a client that always
     * renders a seal row gets wrong. Most estates hold no certification at all,
     * which is not a mark against them.
     */
    makeWithoutSeals(
      overrides: Overrides<EstateVoiceContractShape> = {}
    ): EstateVoiceContractShape {
      return EstateVoiceContract.StubFactory.make({
        seals: undefined,
        quote: undefined,
        ...overrides
      });
    }
  }
};
