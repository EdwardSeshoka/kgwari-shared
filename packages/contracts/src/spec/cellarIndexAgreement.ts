import type { CollectionContract } from "../collections/index.js";
import type {
  CellarDoorContract,
  CellarSectionContract,
  GetCellarIndexResponse
} from "../cellar/index.js";

/**
 * The cellar index's rules — one definition of "correct" for two composers.
 *
 * ## Why these exist at all
 *
 * Composition lives in the backend. This package publishes the types, the doubles
 * and the seeds, but never the composer — so a rule about how a cellar's figures
 * are derived exists twice: once in the samples generator here, once in whatever
 * serves `GET /cellar/index`. A rule held in two places is a rule that drifts, and
 * the cellar has more of them than any other surface because almost everything on
 * its masthead is a count of something the response does not carry.
 *
 * These take DATA, so the samples package runs them over its seeds and the backend
 * runs the same functions over its own responses. When the two disagree, one
 * composer is wrong and the message names the rule it broke.
 *
 * ## What they do NOT check
 *
 * Shape — that is the type checker's job. Every rule below is one a perfectly
 * well-typed response can still get wrong, and most of them are about two numbers
 * that must agree while nothing structural makes them.
 *
 * ## Declining a rule is not calling it
 *
 * One named export per rule, grouped per surface, no skip flags and no options bag.
 * A published assertion fails somebody else's build, so it may never dictate
 * without an opt-out — see `ROUTE_CARD_RULES`, which states the trade in full.
 */

/** Thrown when a rule fails. The message always names the rule that broke. */
export class CellarIndexAgreementError extends Error {
  readonly rule: string;

  constructor(rule: string, detail: string) {
    super(`${rule}: ${detail}`);
    this.name = "CellarIndexAgreementError";
    this.rule = rule;
  }
}

const fail = (rule: string, detail: string): never => {
  throw new CellarIndexAgreementError(rule, detail);
};

const rowsOf = (index: GetCellarIndexResponse): CollectionContract[] =>
  index.sections.flatMap((section) => section.items as CollectionContract[]);

const sectionOf = (
  index: GetCellarIndexResponse,
  kind: CellarSectionContract["kind"]
): CellarSectionContract | undefined => index.sections.find((section) => section.kind === kind);

const collectionDoors = (index: GetCellarIndexResponse) =>
  index.doors.filter(
    (door): door is Extract<CellarDoorContract, { target: { kind: "collection" } }> =>
      door.target.kind === "collection"
  );

/** What a cellar rule is given: one member's index, whole. */
export type CellarIndexInput = {
  index: GetCellarIndexResponse;
};

/**
 * A member's cellar home, checked against itself.
 *
 * The index is one response precisely so its parts cannot disagree — and being one
 * response is what makes disagreement CHECKABLE rather than a race between three
 * requests. These are the checks that buys.
 */
export const CELLAR_INDEX_RULES = {
  /**
   * A lens states its rule, and nothing else does.
   *
   * The biconditional {@link CollectionContract.rule} describes and cannot enforce:
   * present if and only if `kind === "lens"`. Both halves are asserted because both
   * fail in production and neither is visible in a type.
   *
   * A lens WITHOUT one is a row that cannot explain itself — the reader is shown an
   * answer and denied the question, on the one kind whose contents they cannot see
   * from the card. A shelf WITH one is worse: it is somebody's enumerated list
   * wearing a rule it does not run, which is the frozen-from provenance this field
   * is explicitly not, and a client that offers "refresh from rule" on it rebuilds a
   * live rule inside a shelf.
   */
  lensStatesItsRule({ index }: CellarIndexInput): void {
    for (const row of rowsOf(index)) {
      if (row.kind === "lens" && !row.rule) {
        fail("lensStatesItsRule", `lens "${row.id}" carries no rule`);
      }
      if (row.kind !== "lens" && row.rule) {
        fail("lensStatesItsRule", `${row.kind} "${row.id}" carries a rule, which only a lens may`);
      }
    }
  },

  /**
   * A rule says something — a key, and no empty operand list.
   *
   * `operands: []` is the failure this catches, and it is a composer's most natural
   * mistake: a predicate that takes none should OMIT the field, because an empty
   * array reads to a render edge as "interpolate nothing here" and produces a
   * sentence with a hole in it rather than a sentence without a slot.
   */
  ruleIsSubstantive({ index }: CellarIndexInput): void {
    for (const row of rowsOf(index)) {
      if (!row.rule) continue;
      if (row.rule.key.length === 0) {
        fail("ruleIsSubstantive", `lens "${row.id}" has an empty rule key`);
      }
      if (row.rule.operands && row.rule.operands.length === 0) {
        fail(
          "ruleIsSubstantive",
          `lens "${row.id}" sends operands: [] — omit the field instead`
        );
      }
    }
  },

  /**
   * A door carries its target's OWN words, not a second copy of them.
   *
   * Every collection door whose target is on this page must match that row's title
   * and rule exactly. The door and the lens are one record read twice, and this is
   * the check that says so.
   *
   * A door whose target fell past the cursor is SKIPPED rather than failed — that is
   * the whole reason the strings are denormalised, and demanding the row be present
   * would assert the opposite of what the design decided.
   */
  doorAgreesWithItsLens({ index }: CellarIndexInput): void {
    const byId = new Map(rowsOf(index).map((row) => [row.id, row]));
    for (const door of collectionDoors(index)) {
      const target = byId.get(door.target.collectionId);
      if (!target) continue;
      if (target.title !== door.title) {
        fail(
          "doorAgreesWithItsLens",
          `door "${door.target.collectionId}" says "${door.title}" and its row says "${target.title}"`
        );
      }
      if (JSON.stringify(target.rule ?? null) !== JSON.stringify(door.rule ?? null)) {
        fail(
          "doorAgreesWithItsLens",
          `door "${door.target.collectionId}" and its row disagree about the rule`
        );
      }
    }
  },

  /**
   * The Ready-this-year door counts what the summary counts.
   *
   * One number computed once, by one rule, and sent twice. A door that names a set
   * and then disagrees with the masthead above it is worse than no door — a member
   * reads "12 ready this year" and taps through to fourteen bottles.
   *
   * Keyed on the door's target rather than on a title, because the title is words
   * and words are the author's.
   */
  readyThisYearAgrees({ index }: CellarIndexInput): void {
    const byId = new Map(rowsOf(index).map((row) => [row.id, row]));
    for (const door of collectionDoors(index)) {
      const target = byId.get(door.target.collectionId);
      if (!target) continue;
      if (door.count !== target.itemCount) {
        fail(
          "readyThisYearAgrees",
          `door "${door.target.collectionId}" counts ${door.count} and its row counts ${target.itemCount}`
        );
      }
    }
  },

  /**
   * A section's count describes the SECTION, never the page of it that arrived.
   *
   * `count` may exceed `items.length` — that is paging working. It may never be
   * LESS, which is a composer that counted its own page and then sent more rows than
   * it admitted to.
   *
   * A section that has more to give must say so: `count > items.length` with no
   * `nextCursor` strands every row past the first page, and the member is told there
   * are fifteen shelves and shown ten forever.
   */
  sectionCountDescribesTheSection({ index }: CellarIndexInput): void {
    for (const section of index.sections) {
      if (section.count < section.items.length) {
        fail(
          "sectionCountDescribesTheSection",
          `${section.kind} counts ${section.count} and carries ${section.items.length} rows`
        );
      }
      if (section.count > section.items.length && !section.nextCursor) {
        fail(
          "sectionCountDescribesTheSection",
          `${section.kind} counts ${section.count}, carries ${section.items.length} and offers no cursor`
        );
      }
    }
  },

  /**
   * A section that arrived is a section with something in it.
   *
   * Empty sections are omitted rather than sent, because a heading over no rows asks
   * a reader what they have lost and the answer is nothing — they have never made a
   * lens. A composer that sends four sections unconditionally has turned a cellar
   * with two shelves into a page of three apologies.
   */
  emptySectionsAreOmitted({ index }: CellarIndexInput): void {
    for (const section of index.sections) {
      if (section.items.length === 0) {
        fail("emptySectionsAreOmitted", `${section.kind} arrived with no rows — omit it instead`);
      }
    }
  },

  /**
   * Every section holds the kind it says it does.
   *
   * The `routes` run holds itineraries and the other three hold what they are named
   * for — a lens under "Shelves" is the one thing the three-way split exists to
   * prevent, and it is exactly what taking the first N of a mixed landing produces.
   */
  sectionsHoldTheirOwnKind({ index }: CellarIndexInput): void {
    for (const section of index.sections) {
      const expected =
        section.kind === "shelves" ? "shelf" : section.kind === "lenses" ? "lens" : undefined;
      if (section.kind === "routes") {
        for (const row of section.items) {
          if (row.kind !== "itinerary") {
            fail("sectionsHoldTheirOwnKind", `routes holds a ${row.kind}, "${row.id}"`);
          }
        }
        continue;
      }
      if (!expected) continue;
      for (const row of section.items) {
        if (row.kind !== expected) {
          fail("sectionsHoldTheirOwnKind", `${section.kind} holds a ${row.kind}, "${row.id}"`);
        }
      }
    }
  },

  /**
   * The price band follows the suppression flag absolutely.
   *
   * `figuresAvailable: false` with a `priceBand` present is a composer that
   * suppressed the figure line and then sent the one figure the line was hiding. The
   * threshold is server policy and this flag is how it reaches a client; a band that
   * survives it hands the client back the decision it was never supposed to make.
   */
  suppressedFiguresCarryNoBand({ index }: CellarIndexInput): void {
    const { figuresAvailable, priceBand } = index.summary;
    if (!figuresAvailable && priceBand) {
      fail(
        "suppressedFiguresCarryNoBand",
        "figuresAvailable is false and a priceBand was sent anyway"
      );
    }
  },

  /**
   * A band's low is not above its high, and both are one currency.
   *
   * Nothing is ever converted, so a band spanning two currencies is not a wide band
   * — it is two facts printed as one, and the honest answer for a cellar bought
   * across two markets is no band at all.
   */
  bandIsOneCurrencyAndOrdered({ index }: CellarIndexInput): void {
    const band = index.summary.priceBand;
    if (!band) return;
    if (band.low.currency !== band.high.currency) {
      fail(
        "bandIsOneCurrencyAndOrdered",
        `band spans ${band.low.currency} and ${band.high.currency} — send no band instead`
      );
    }
    if (band.low.amountMinorUnits > band.high.amountMinorUnits) {
      fail("bandIsOneCurrencyAndOrdered", "band's low is above its high");
    }
  },

  /**
   * Wines on record are never fewer than the estates behind them, and never more
   * than the bottles held.
   *
   * `wines` counts distinct wines INCLUDING the drunk-and-kept, so it sits between
   * `estates` and `bottles`. A composer that reports more wines than bottles has
   * counted something twice; one that reports fewer wines than estates has an estate
   * with no wine under it.
   *
   * Deliberately not a rule about `readyThisYear`, which is a subset of bottles by
   * its own definition and is checked against its door instead.
   */
  summaryCountsAreOrdered({ index }: CellarIndexInput): void {
    const { bottles, wines, estates } = index.summary;
    if (wines > bottles) {
      fail("summaryCountsAreOrdered", `${wines} wines against ${bottles} bottles`);
    }
    if (estates > wines) {
      fail("summaryCountsAreOrdered", `${estates} estates against ${wines} wines`);
    }
  },

  /**
   * The routes door counts wines, and the cellar counts bottles, and they are not
   * the same number by coincidence either.
   *
   * This is the phantom-possession check, and it is the one rule here that cannot
   * prove what it is really about. It cannot verify that a CLIENT does not add them
   * — nothing in a response can — so it verifies the next best thing: that a
   * `metOnRoutes` door exists only when there is something met, and never carries a
   * count that was quietly folded into `bottles`.
   *
   * A door with a count of zero is the failure: it puts a row on the page that reads
   * as a set a member can open, and there is nothing behind it. Omit the door, the
   * way an empty section is omitted.
   */
  metOnRoutesIsItsOwnCount({ index }: CellarIndexInput): void {
    for (const door of index.doors) {
      if (door.target.kind !== "metOnRoutes") continue;
      if (door.count <= 0) {
        fail("metOnRoutesIsItsOwnCount", "a metOnRoutes door with nothing behind it — omit it");
      }
    }
  },

  /**
   * A routes section and a routes door travel together.
   *
   * A member with no itineraries has neither; a member with itineraries she has
   * poured nothing on has the section and no door. What cannot happen is a door
   * naming wines met on routes when the index shows no routes at all — that is a
   * projection over an empty set, and it means the two halves were composed from
   * different reads of the member's own data.
   */
  routesDoorImpliesRoutes({ index }: CellarIndexInput): void {
    const hasDoor = index.doors.some((door) => door.target.kind === "metOnRoutes");
    if (hasDoor && !sectionOf(index, "routes")) {
      fail("routesDoorImpliesRoutes", "a metOnRoutes door with no routes section to have met them on");
    }
  }
};
