import type { WineRegisterContract as WineRegisterContractShape } from "../register.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { AromaMentionContract } from "./AromaMentionContractStub.js";
import { ColourReadingContract } from "./ColourReadingContractStub.js";
import { RegisterDisagreementContract } from "./RegisterDisagreementContractStub.js";
import { RegisterScaleMetricContract } from "./RegisterScaleMetricContractStub.js";

/**
 * Everything the community has said about one vintage, aggregated — and the only
 * layer of a record that moves with note count.
 *
 * ## Not a state machine, and the doubles say so
 *
 * A record with one note and a record with fourteen hundred are the SAME PAGE.
 * The identity is matched at ingest and unchanged; only the register thickens.
 * So `makeThin()` and `make()` differ in what evidence they carry, never in what
 * kind of thing they are — a consumer that branches on "is this a new wine"
 * has invented a second state the model does not have.
 *
 * Every threshold is server policy and appears here as an ABSENT field:
 * `verdictDistribution` and `verdictSummary` are missing from the thin register,
 * and `disagreement` is missing from both thin and ordinary ones. A client that
 * compares a count against a hardcoded number has taken editorial judgement into
 * its release cycle.
 *
 * INVARIANT: a claim does not move any of this. The estate can supply the cellar
 * record and write the essay; the verdict still comes from the members.
 */
export const WineRegisterContract = {
  StubFactory: {
    ...defineStub<WineRegisterContractShape>({
      noteCount: 1480,
      verdict: "Essential",
      verdictDistribution: [
        { verdict: "Unforgettable", percentage: 18 },
        { verdict: "Essential", percentage: 48 },
        { verdict: "Worth Revisiting", percentage: 25 },
        { verdict: "An Interesting Discovery", percentage: 9 }
      ],
      verdictSummary: { atOrAbove: "Worth Revisiting", percentage: 91 },
      groups: [
        {
          key: "palate",
          metrics: [
            RegisterScaleMetricContract.StubFactory.make(),
            RegisterScaleMetricContract.StubFactory.makeSweetness()
          ]
        },
        {
          key: "conclusion",
          metrics: [RegisterScaleMetricContract.StubFactory.makeThinlyAnswered()]
        }
      ],
      aromas: [
        AromaMentionContract.StubFactory.make(),
        AromaMentionContract.StubFactory.makeSecondary(),
        AromaMentionContract.StubFactory.makeTertiary()
      ],
      colour: ColourReadingContract.StubFactory.make()
    }),

    /**
     * One note in, and every threshold unmet.
     *
     * No distribution, no summary, no disagreement — and a metric that names
     * whose single reading it is. The honest shape of a wine somebody wrote
     * about yesterday, and the one a consumer built against the dense fixture
     * will crash on.
     */
    makeThin(overrides: Overrides<WineRegisterContractShape> = {}): WineRegisterContractShape {
      return WineRegisterContract.StubFactory.make({
        noteCount: 1,
        verdict: "Worth Revisiting",
        verdictDistribution: undefined,
        verdictSummary: undefined,
        groups: [
          {
            key: "palate",
            metrics: [RegisterScaleMetricContract.StubFactory.makeSingleReading()]
          }
        ],
        aromas: [AromaMentionContract.StubFactory.makeNamedOnce()],
        colour: undefined,
        ...overrides
      });
    },

    /**
     * Nobody has written about it yet.
     *
     * `noteCount: 0` with EMPTY groups and aromas rather than absent ones — the
     * register exists, it simply has nothing in it, which is not the same as a
     * record without a register. And still no verdict: the verdict comes from
     * members, so a wine nobody has judged has none.
     */
    makeEmpty(overrides: Overrides<WineRegisterContractShape> = {}): WineRegisterContractShape {
      return WineRegisterContract.StubFactory.make({
        noteCount: 0,
        verdict: undefined,
        verdictDistribution: undefined,
        verdictSummary: undefined,
        groups: [],
        aromas: [],
        colour: undefined,
        ...overrides
      });
    },

    /** Thick enough to have an argument in it. */
    makeWithDisagreement(
      overrides: Overrides<WineRegisterContractShape> = {}
    ): WineRegisterContractShape {
      return WineRegisterContract.StubFactory.make({
        disagreement: RegisterDisagreementContract.StubFactory.make(),
        ...overrides
      });
    }
  }
};
