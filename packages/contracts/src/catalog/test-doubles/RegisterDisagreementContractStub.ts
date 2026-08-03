import type { RegisterDisagreementContract as RegisterDisagreementContractShape } from "../register.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * A named split — the section that opens when enough members disagree about the
 * same thing to make the disagreement the interesting part.
 *
 * A page that reports only the average hides it, which is the argument for the
 * whole section: "most members say garnet" is less true and less useful than
 * "the room is split between garnet and ruby, and here is how".
 *
 * `body` is the one genuinely authored field in the entire register — curated
 * prose, so it carries the language it was written in. `makeUnwritten()` models
 * the split that has opened before an editor has said anything about it, which
 * is the normal order of events and the case a consumer that assumes `body` gets
 * wrong.
 */
export const RegisterDisagreementContract = {
  StubFactory: {
    ...defineStub<RegisterDisagreementContractShape>({
      subjectKey: "aroma.fynbosSmoke",
      body: {
        source: "negotiated",
        text: "Half the room finds smoke here. The other half calls it dried herb, and both have been drinking it for a decade.",
        languageTag: "en"
      },
      split: [
        { key: "aroma.fynbosSmoke", percentage: 52 },
        { key: "aroma.cedar", percentage: 48 }
      ],
      namedBy: 318
    }),

    /** The split exists; nobody has written it up yet. */
    makeUnwritten(
      overrides: Overrides<RegisterDisagreementContractShape> = {}
    ): RegisterDisagreementContractShape {
      return RegisterDisagreementContract.StubFactory.make({ body: undefined, ...overrides });
    }
  }
};
