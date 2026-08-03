import type { NoteReadingsContract as NoteReadingsContractShape } from "../readings.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * The structured half of a note.
 *
 * Four factories, because the interesting states of this contract are not
 * variations on a full answer — they are the three shapes a consumer gets wrong.
 *
 * `make()` is a fully answered red. `makeSparse()` is the note most members
 * actually write: words, a verdict, and one or two readings, which is the case
 * where a client that assumes `readings.colour` exists throws. `makeFaulted()`
 * is the row the register must EXCLUDE, and it is the reason this double is
 * worth shipping — an aggregation that silently counts it punishes an estate for
 * a bad cork. `makeBlind()` carries the pour block that says the taster did not
 * know what was in the glass.
 */
export const NoteReadingsContract = {
  StubFactory: {
    ...defineStub<NoteReadingsContractShape>({
      scales: [
        { key: "tannin", value: 4 },
        { key: "acidity", value: 3 },
        { key: "body", value: 4 },
        { key: "finish", value: 4 },
        { key: "sweetness", value: 1 },
        { key: "noseIntensity", value: 4 },
        { key: "colourDepth", value: 4 }
      ],
      aromas: ["aroma.wildPlum", "aroma.fynbosSmoke", "aroma.cedar"],
      colour: { coreKey: "colour.deepGarnet", rimKey: "rim.ruby" },
      pour: {
        tasted: "pour.sighted",
        decant: "pour.decantedAnHour",
        glass: "glass.bordeaux",
        temperature: { source: "measurement", value: 18, unitKey: "unit.celsius" },
        pairing: {
          source: "negotiated",
          text: "Lamb off the coals, more smoke than sauce.",
          languageTag: "en"
        }
      },
      condition: "condition.noFaults",
      drinkingWindow: {
        window: { source: "yearRange", from: 2026, to: 2036 },
        atPeak: false
      }
    }),

    /**
     * Two answers and nothing else — the shape of most real notes.
     *
     * Every field here is optional and an absent reading means the member did
     * not answer, which is a different fact from a middling answer. A consumer
     * that reads `readings.colour.coreKey` without checking crashes on exactly
     * this row.
     */
    makeSparse(overrides: Overrides<NoteReadingsContractShape> = {}): NoteReadingsContractShape {
      return NoteReadingsContract.StubFactory.make({
        scales: [{ key: "tannin", value: 4 }],
        aromas: ["aroma.wildPlum"],
        colour: undefined,
        pour: undefined,
        condition: undefined,
        drinkingWindow: undefined,
        ...overrides
      });
    },

    /**
     * A corked bottle.
     *
     * The exclusion case, and the whole reason bottle condition is contracted.
     * A note reporting a fault is a real note that reads in the room and counts
     * for NOTHING in the register — not the verdict distribution, not the scale
     * means, not the aromas. A test that never holds this row is a test that
     * cannot catch an aggregation quietly marking an estate down for a failed
     * closure.
     */
    makeFaulted(overrides: Overrides<NoteReadingsContractShape> = {}): NoteReadingsContractShape {
      return NoteReadingsContract.StubFactory.make({
        condition: "condition.corked",
        aromas: [],
        ...overrides
      });
    },

    /**
     * Tasted blind — the pour fact that changes what the note is worth as
     * evidence, and the one a register must not average away against sighted
     * readings of the same wine.
     */
    makeBlind(overrides: Overrides<NoteReadingsContractShape> = {}): NoteReadingsContractShape {
      return NoteReadingsContract.StubFactory.make({
        pour: { tasted: "pour.blind", glass: "glass.universal" },
        ...overrides
      });
    }
  }
};
