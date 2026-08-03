import type { EstateSealContract as EstateSealContractShape } from "../record.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * A certification or membership the estate supplied.
 *
 * `sinceYear` and `auditedYear` are ORDINALS sent as digits, never "Member since
 * 2011" — a year through a grouping formatter renders as "2 011" in French, and
 * a year inside a sentence is a sentence in one language.
 *
 * `makeUnaudited()` is the honest case: a body an estate belongs to but which
 * has not audited them recently. Absent is not zero and not "audited this year".
 */
export const EstateSealContract = {
  StubFactory: {
    ...defineStub<EstateSealContractShape>({
      key: "oldVineProject",
      name: { source: "canonical", text: "Old Vine Project" },
      sinceYear: 2011,
      auditedYear: 2025
    }),

    /** Belongs, but carries no audit date. */
    makeUnaudited(overrides: Overrides<EstateSealContractShape> = {}): EstateSealContractShape {
      return EstateSealContract.StubFactory.make({
        key: "wieta",
        name: { source: "canonical", text: "WIETA" },
        auditedYear: undefined,
        ...overrides
      });
    }
  }
};
