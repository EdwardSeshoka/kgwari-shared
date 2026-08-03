import type { RecordFieldContract as RecordFieldContractShape } from "../record.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { FieldVerificationContract } from "./FieldVerificationContractStub.js";

/**
 * One row of the record — and the double that carries this model's governing
 * idea.
 *
 * **A row is enumerable while EMPTY.** `makePending()` is a row with a `key`, a
 * `kind` and no `value`: the page lists the facts it is waiting on the estate
 * for, by name, and absence is a statement rather than missing data. A consumer
 * that filters rows without values renders a record that looks complete because
 * it dropped everything unanswered — which is precisely the progress-bar model
 * this design replaced.
 *
 * The three factories match the three {@link RecordFieldKind}s, because what a
 * member may DO to a row is decided entirely by which one it is: a reference row
 * can be confirmed or disputed, an estate-private row can only be waited on, and
 * a commercial row belongs to whoever is selling.
 */
export const RecordFieldContract = {
  StubFactory: {
    /**
     * A reference row: matched at ingest, ALWAYS has a value, and carries the
     * verification block — the only kind that does. A member's job here is to
     * confirm or dispute it, never to fill it in.
     */
    ...defineStub<RecordFieldContractShape>({
      key: "alcohol",
      value: {
        source: "measurement",
        value: 14.21,
        unitKey: "unit.percentAbv",
        fractionDigits: 2
      },
      source: "wo",
      sourceRef: { source: "canonical", text: "WO 2018/114592" },
      kind: "reference",
      verification: FieldVerificationContract.StubFactory.make()
    }),

    /**
     * An estate-private row nobody has answered.
     *
     * No `value`, no `source`, and NO `verification` — there is nothing to
     * confirm about a fact the estate has not supplied. The row still renders,
     * named, which is the whole point.
     */
    makePending(overrides: Overrides<RecordFieldContractShape> = {}): RecordFieldContractShape {
      return RecordFieldContract.StubFactory.make({
        key: "yield",
        value: undefined,
        source: undefined,
        sourceRef: undefined,
        kind: "estate_private",
        verification: undefined,
        ...overrides
      });
    },

    /**
     * The same key, once a producer has claimed and answered it.
     *
     * Deliberately the same `key` as {@link makePending} — that is how the model
     * works: a field carries one key through its whole life, and pending becomes
     * answered without becoming a different row. Still no `verification`: an
     * estate's own account of its own cellar is not put to a vote.
     */
    makeEstateAnswered(
      overrides: Overrides<RecordFieldContractShape> = {}
    ): RecordFieldContractShape {
      return RecordFieldContract.StubFactory.make({
        key: "yield",
        value: { source: "measurement", value: 4.2, unitKey: "unit.tonnesPerHectare" },
        source: "estate",
        sourceRef: undefined,
        kind: "estate_private",
        verification: undefined,
        ...overrides
      });
    },

    /** A commercial row — opened by a distributor claim and only by one. */
    makeCommercial(
      overrides: Overrides<RecordFieldContractShape> = {}
    ): RecordFieldContractShape {
      return RecordFieldContract.StubFactory.make({
        key: "importer",
        value: { source: "canonical", text: "Great Domaines" },
        source: "distributor",
        sourceRef: undefined,
        kind: "commercial",
        verification: undefined,
        ...overrides
      });
    },

    /**
     * A row that cites the piece of writing which established it.
     *
     * The record's end of the editorial reverse index. It renders "answered by
     * *Fourteen clones, one rootstock*" instead of a bare Estate tag — see
     * {@link ../editorial!EditorialClaimAnswerContract}, which is the authored
     * end. `source` stays: the source says WHO supplied the fact, `answeredBy`
     * says where they said it.
     */
    makeAnsweredByEditorial(
      overrides: Overrides<RecordFieldContractShape> = {}
    ): RecordFieldContractShape {
      return RecordFieldContract.StubFactory.make({
        key: "varietal",
        value: { source: "canonical", text: "Cabernet Sauvignon" },
        source: "estate",
        answeredBy: {
          editorialId: "editorial_fourteen-clones",
          title: {
            source: "negotiated",
            text: "Fourteen clones, one rootstock",
            languageTag: "en"
          }
        },
        verification: undefined,
        ...overrides
      });
    },

    /**
     * A matched value a member is arguing with. The value is still present,
     * because a fact under review is shown rather than hidden.
     */
    makeDisputed(overrides: Overrides<RecordFieldContractShape> = {}): RecordFieldContractShape {
      return RecordFieldContract.StubFactory.make({
        verification: FieldVerificationContract.StubFactory.makeDisputed(),
        ...overrides
      });
    },

    /**
     * A row imported from a trade database and NOT verified by us.
     *
     * The source exists so the page can say so. A client that renders every
     * source identically has flattened the one distinction a reader needs in
     * order to decide how much to trust a row.
     */
    makeUnverifiedImport(
      overrides: Overrides<RecordFieldContractShape> = {}
    ): RecordFieldContractShape {
      return RecordFieldContract.StubFactory.make({
        key: "closure",
        value: { source: "chrome", key: "closure.naturalCork" },
        source: "db",
        sourceRef: { source: "canonical", text: "Wine-Searcher" },
        ...overrides
      });
    }
  }
};
