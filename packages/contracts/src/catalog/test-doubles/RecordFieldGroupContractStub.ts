import type { RecordFieldGroupContract as RecordFieldGroupContractShape } from "../record.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { RecordFieldContract } from "./RecordFieldContractStub.js";

/**
 * A titled run of rows, grouped by WHO can answer them.
 *
 * `labelKey` and `noteKey` are derived from `key` by construction — the contract
 * types them as template literals so `record.group.matched` compiles and
 * `record.group.mtached` does not. These doubles build them with the same
 * template rather than by calling `recordGroupLabelKey`, deliberately: a stub
 * that derived its own expected value could not catch the builder drifting.
 *
 * `makeEstatePrivate()` is the group that matters — a run of rows with NO values
 * in it, which is the honest replacement for the progress bar this model
 * removed. A consumer that skips empty groups renders a record with nothing
 * pending and no way to see what the estate owes.
 */
export const RecordFieldGroupContract = {
  StubFactory: {
    ...defineStub<RecordFieldGroupContractShape>({
      key: "matched",
      labelKey: "record.group.matched",
      noteKey: "record.group.matched.note",
      fields: [
        RecordFieldContract.StubFactory.make(),
        RecordFieldContract.StubFactory.makeUnverifiedImport()
      ]
    }),

    /** Named, listed, and entirely unanswered — waiting on the estate. */
    makeEstatePrivate(
      overrides: Overrides<RecordFieldGroupContractShape> = {}
    ): RecordFieldGroupContractShape {
      return RecordFieldGroupContract.StubFactory.make({
        key: "estatePrivate",
        labelKey: "record.group.estatePrivate",
        noteKey: "record.group.estatePrivate.note",
        fields: [
          RecordFieldContract.StubFactory.makePending(),
          RecordFieldContract.StubFactory.makePending({ key: "soil" }),
          RecordFieldContract.StubFactory.makePending({ key: "fermentation" })
        ],
        ...overrides
      });
    },

    /**
     * The same group once a producer has claimed — same key, same rows, values
     * arrived. And NO `noteKey`: only the two sourced groups explain themselves,
     * because "answered by the estate" already says where its contents came from.
     */
    makeEstateAnswered(
      overrides: Overrides<RecordFieldGroupContractShape> = {}
    ): RecordFieldGroupContractShape {
      return RecordFieldGroupContract.StubFactory.make({
        key: "estateAnswered",
        labelKey: "record.group.estateAnswered",
        noteKey: undefined,
        fields: [RecordFieldContract.StubFactory.makeEstateAnswered()],
        ...overrides
      });
    },

    /** What a distributor claim opens — commerce, and nothing else. */
    makeDistributorAnswered(
      overrides: Overrides<RecordFieldGroupContractShape> = {}
    ): RecordFieldGroupContractShape {
      return RecordFieldGroupContract.StubFactory.make({
        key: "distributorAnswered",
        labelKey: "record.group.distributorAnswered",
        noteKey: undefined,
        fields: [RecordFieldContract.StubFactory.makeCommercial()],
        ...overrides
      });
    }
  }
};
