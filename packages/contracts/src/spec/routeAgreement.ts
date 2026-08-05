import type { ListCellarResponse } from "../cellar/index.js";
import type { CellarFirstMetContract } from "../cellar/index.js";
import type {
  GetCollectionResponse,
  ItineraryCollectionContract,
  ItineraryStopContract
} from "../collections/index.js";
import type { ContributionContract, ContributionCountContract } from "../contributions/index.js";
import type { TastingNoteContract } from "../social/index.js";

/**
 * The route agreement rules — one definition of "correct" for two composers.
 *
 * ## Why this is published
 *
 * Composition lives in the backend. This package publishes the types, the doubles and
 * the seeds, but never the composer — so a rule about how a route's numbers are
 * computed exists twice: once in the samples generator, once in whatever serves
 * `GET /collections`. Nothing tied the two copies together, and a rule held in two
 * places is a rule that drifts.
 *
 * These are the tie. They take DATA, so the samples package runs them over its seeds
 * and the backend runs the same functions over its own responses. When the two
 * disagree, one composer is wrong and the message names the rule it broke.
 *
 * ## Rules, not bundles — and why that matters
 *
 * Every rule is its own named export, grouped in a record per surface. That is a
 * deliberate answer to the objection this design nearly died on: a published
 * assertion FAILS A BUILD, so shipping seven fat functions each checking eight things
 * would dictate all fifty-six to every consumer with no way to decline one but to fork
 * the file.
 *
 * Declining a rule is therefore just not calling it. There are no skip flags and no
 * options bag, because a rule that can be switched off silently is a rule that reads
 * as passing when it is disabled.
 *
 * A consumer picks their own posture, explicitly:
 *
 *     // every rule, including ones added in later versions
 *     for (const rule of Object.values(ROUTE_CARD_RULES)) rule({ card, detail });
 *
 *     // pinned — immune to additions
 *     ROUTE_CARD_RULES.itemCountEqualsStops({ card, detail });
 *     ROUTE_CARD_RULES.tallyMatchesStops({ card, detail });
 *
 * Both are legitimate. Iterating a record is an opt-in to future strictness; naming a
 * subset is a decision to pin. Neither is imposed, which is the whole reason this
 * could be published at all.
 *
 * ## Versioning
 *
 * - **Adding a rule** is a MINOR. Only consumers who asked for "all rules" by
 *   iterating a record are affected, and that was their choice.
 * - **Changing what a named rule means** is a MAJOR, exactly like any other contract.
 * - **Renaming or removing one** is a MAJOR.
 *
 * ## Plain `Error`, never `node:assert`
 *
 * Two reasons, both structural. This package is bundled by the frontend, and
 * `node:assert` would be the first Node builtin to ship in it — a browser build would
 * need a shim. And an assertion library ties a spec to one test runner's reporting;
 * a thrown `Error` works under any of them.
 *
 * ## What these do NOT check
 *
 * Shape. That is the type checker's job and the contracts already do it. Every rule
 * below is one a well-typed response can still get wrong.
 */

/** Thrown when a rule fails. The message always names the rule that broke. */
export class RouteAgreementError extends Error {
  readonly rule: string;

  constructor(rule: string, detail: string) {
    super(`${rule}: ${detail}`);
    this.name = "RouteAgreementError";
    this.rule = rule;
  }
}

const fail = (rule: string, detail: string): never => {
  throw new RouteAgreementError(rule, detail);
};

const stopsOf = (detail: GetCollectionResponse): ItineraryStopContract[] =>
  detail.items.flatMap((item) => (item.subject === "stops" ? [item.stop] : []));

const sumWines = (stops: ItineraryStopContract[]): number =>
  stops.reduce((total, stop) => total + (stop.wines?.length ?? 0), 0);

const sumNotes = (stops: ItineraryStopContract[]): number =>
  stops.reduce((total, stop) => total + (stop.notes?.length ?? 0), 0);

/** What a card rule is given: one route's card, and the page it opens. */
export type RouteCardInput = {
  card: ItineraryCollectionContract;
  detail: GetCollectionResponse;
};

/**
 * A route's card against the page it opens.
 *
 * The card must not restate arithmetic its own page can contradict. A backend that
 * stores `itemCount` beside the stops has two numbers that must agree, and they will
 * not: the first stop deleted after publication makes a liar of the card.
 */
export const ROUTE_CARD_RULES = {
  /** A route's subject is `stops`. It was `estates`, and that is what the change fixed. */
  subjectIsStops({ card }: RouteCardInput): void {
    if (card.subject !== "stops") {
      fail("subjectIsStops", `route "${card.id}" claims subject "${card.subject}"`);
    }
  },

  /**
   * Tense is SENT, never inferred from whether anything has been written yet.
   *
   * Derive it and a member writing up her day watches the card flip halfway through
   * the first note, taking the booking buttons on the remaining stops with it.
   */
  modeIsStated({ card }: RouteCardInput): void {
    if (card.mode !== "planned" && card.mode !== "documented") {
      fail("modeIsStated", `route "${card.id}" has no mode`);
    }
  },

  /** Every row of a route's detail is a stop. One subject, like every other collection. */
  everyRowIsAStop({ card, detail }: RouteCardInput): void {
    for (const item of detail.items) {
      if (item.subject !== "stops") {
        fail("everyRowIsAStop", `route "${card.id}" holds a "${item.subject}" row`);
      }
    }
  },

  /**
   * The count is the STOPS, not the places.
   *
   * A route that has dinner where it started called at four places and made five
   * stops. Counting places is what the old estates-subject shape could do, and it
   * had to duplicate a row or lose the evening.
   */
  itemCountEqualsStops({ card, detail }: RouteCardInput): void {
    const stops = stopsOf(detail);
    if (card.itemCount !== stops.length) {
      fail(
        "itemCountEqualsStops",
        `route "${card.id}" says ${card.itemCount} stops, the detail has ${stops.length}`
      );
    }
  },

  /** A documented route's sub-line counts exactly what is nested in its stops. */
  tallyMatchesStops({ card, detail }: RouteCardInput): void {
    if (card.mode !== "documented") return;
    const stops = stopsOf(detail);
    const wines = sumWines(stops);
    const notes = sumNotes(stops);
    if (card.contents === undefined) {
      fail("tallyMatchesStops", `route "${card.id}" happened but carries no tally`);
      return;
    }
    if (card.contents.wines !== wines || card.contents.notes !== notes) {
      fail(
        "tallyMatchesStops",
        `route "${card.id}" says ${card.contents.wines} wines and ${card.contents.notes} notes, ` +
          `its stops hold ${wines} and ${notes}`
      );
    }
  },

  /**
   * A plan carries no tally, and nothing has been poured on it.
   *
   * ABSENT rather than zeroed: "0 wines · 0 notes" turns an itinerary somebody has
   * not driven yet into an empty diary.
   */
  planCarriesNoTally({ card, detail }: RouteCardInput): void {
    if (card.mode !== "planned") return;
    if (card.contents !== undefined) {
      fail("planCarriesNoTally", `route "${card.id}" is a plan and carries a tally`);
    }
    const stops = stopsOf(detail);
    if (sumWines(stops) > 0 || sumNotes(stops) > 0) {
      fail("planCarriesNoTally", `route "${card.id}" is a plan but something was poured or written`);
    }
  },

  /** Two stops cannot share an id — a client keyed on it would drop one. */
  stopIdsAreUnique({ card, detail }: RouteCardInput): void {
    const ids = stopsOf(detail).map((stop) => stop.id);
    if (new Set(ids).size !== ids.length) {
      fail("stopIdsAreUnique", `route "${card.id}" has two stops sharing an id`);
    }
  },

  /**
   * The strip is keyed on the STOP, not on the place.
   *
   * A route can call at one estate twice, so a strip keyed on the producer silently
   * draws one plate for two stops — and a member who taps it lands nowhere.
   */
  stripKeysOnStops({ card, detail }: RouteCardInput): void {
    const ids = new Set(stopsOf(detail).map((stop) => stop.id));
    for (const entry of card.preview ?? []) {
      if (!ids.has(entry.contentId)) {
        fail(
          "stripKeysOnStops",
          `route "${card.id}" strips "${entry.contentId}", which is not a stop on it`
        );
      }
    }
  },

  /** A strip is a handful of the list, never a census of it. */
  stripIsShorterThanTheList({ card }: RouteCardInput): void {
    const shown = (card.preview ?? []).length;
    if (shown >= card.itemCount) {
      fail(
        "stripIsShorterThanTheList",
        `route "${card.id}" strips ${shown} of ${card.itemCount} — a strip that shows everything is a count`
      );
    }
  }
} as const;

/** What a reference rule is given: the page, and what the server can resolve. */
export type RouteStopInput = {
  detail: GetCollectionResponse;
  producerIds: ReadonlySet<string>;
  wineIds: ReadonlySet<string>;
};

/**
 * What a stop points at, and what it must not carry.
 *
 * A stop carries the domains' own contracts rather than ids so a wine on a route and
 * the same wine in a search result cannot disagree about what it is. That only holds
 * if the wine came FROM the catalogue.
 */
export const ROUTE_STOP_RULES = {
  /** A stop you cannot go to is not a stop. */
  everyPlaceResolves({ detail, producerIds }: RouteStopInput): void {
    for (const stop of stopsOf(detail)) {
      if (!producerIds.has(stop.place.id)) {
        fail("everyPlaceResolves", `stop "${stop.id}" calls at "${stop.place.id}", which resolves to nothing`);
      }
    }
  },

  /** A route cannot pour a vintage the catalogue does not hold. */
  everyPourResolves({ detail, wineIds }: RouteStopInput): void {
    for (const stop of stopsOf(detail)) {
      for (const wine of stop.wines ?? []) {
        if (!wineIds.has(wine.id)) {
          fail("everyPourResolves", `stop "${stop.id}" pours "${wine.id}", which resolves to nothing`);
        }
      }
    }
  },

  /**
   * A stop is dated with a calendar DAY, never an instant.
   *
   * Two stops at one estate on one day are told apart by their position in the route,
   * not by the clock — so sub-day precision buys nothing and costs the timezone
   * question the events domain already had to answer.
   */
  stopDatesAreCalendarDays({ detail }: RouteStopInput): void {
    for (const stop of stopsOf(detail)) {
      if (stop.date === undefined) continue;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(stop.date)) {
        fail("stopDatesAreCalendarDays", `stop "${stop.id}" is dated "${stop.date}", which is not a day`);
      }
    }
  },

  /**
   * An event ref names the evening and nothing more.
   *
   * Kgwari does not take the booking, hold the stock or take the payment — the
   * event's own page is where a member books it.
   */
  eventRefCarriesNoBooking({ detail }: RouteStopInput): void {
    const forbidden = ["admission", "price", "seats", "capacity", "booking", "taken"];
    for (const stop of stopsOf(detail)) {
      if (stop.event === undefined) continue;
      for (const field of forbidden) {
        if (field in stop.event) {
          fail("eventRefCarriesNoBooking", `stop "${stop.id}" carries "${field}" on its event ref`);
        }
      }
    }
  },

  /**
   * An event title is negotiated text, so the language rides WITH the words.
   *
   * The legacy `title` + `titleLanguage` pair must not reappear: two fields that must
   * agree are two fields that eventually will not.
   */
  eventTitleIsNegotiatedText({ detail }: RouteStopInput): void {
    for (const stop of stopsOf(detail)) {
      if (stop.event === undefined) continue;
      if (stop.event.title?.source !== "negotiated") {
        fail("eventTitleIsNegotiatedText", `stop "${stop.id}" has an event title that is not negotiated text`);
      }
      if (!stop.event.title.languageTag) {
        fail("eventTitleIsNegotiatedText", `stop "${stop.id}" has a negotiated title with no language`);
      }
      if ("titleLanguage" in stop.event) {
        fail("eventTitleIsNegotiatedText", `stop "${stop.id}" carries a separate titleLanguage`);
      }
    }
  }
} as const;

/** What a ledger rule is given: the rows a stream would serve, and the notes behind them. */
export type LedgerInput = {
  rows: readonly ContributionContract[];
  notes: readonly TastingNoteContract[];
  /** What the wine's own record publishes as its note count. */
  noteCountFor: (wineVintageId: string) => number | undefined;
};

/**
 * One act, one row — and the half of that rule everyone forgets.
 */
export const LEDGER_RULES = {
  /**
   * A note written into a stop takes no row of its own.
   *
   * Publishing the route was one act. Nine notes from one afternoon would bury the
   * room under one person's Saturday. The filter belongs at the top of whatever
   * builds the stream, not at each call site — if this fails, one producer of one
   * stream forgot it.
   */
  routeNotesTakeNoRow({ rows }: LedgerInput): void {
    for (const row of rows) {
      if (row.kind !== "note") continue;
      if (row.note.origin !== undefined) {
        fail("routeNotesTakeNoRow", `contribution "${row.id}" is a note its route already speaks for`);
      }
    }
  },

  /**
   * Suppressing the ROW is not suppressing the NOTE.
   *
   * The ledger records ACTS; a wine's page records OPINIONS. The tempting shortcut —
   * keeping route notes out of the corpus entirely — passes the rule above and fails
   * this one, which is why both exist.
   */
  routeNotesStillCountOnTheirWines({ notes, noteCountFor }: LedgerInput): void {
    const counted = new Map<string, number>();
    for (const note of notes) {
      counted.set(note.wineVintageId, (counted.get(note.wineVintageId) ?? 0) + 1);
    }
    for (const note of notes) {
      if (note.origin === undefined) continue;
      const published = noteCountFor(note.wineVintageId);
      const held = counted.get(note.wineVintageId) ?? 0;
      if (published === undefined || published < held) {
        fail(
          "routeNotesStillCountOnTheirWines",
          `wine "${note.wineVintageId}" publishes ${published} notes but ${held} exist — ` +
            `a note written on a route was dropped from the wine it judges`
        );
      }
    }
  }
} as const;

/** What a chip rule is given: one member's counts, and their notes. */
export type ChipInput = {
  counts: readonly ContributionCountContract[];
  notes: readonly TastingNoteContract[];
};

/**
 * The chips count ROWS, and say separately what another row speaks for.
 */
export const CHIP_RULES = {
  /** `count` is what tapping the chip will show — standalone notes only. */
  noteChipCountsRows({ counts, notes }: ChipInput): void {
    const chip = counts.find((entry) => entry.kind === "note");
    if (chip === undefined) return;
    const standalone = notes.filter((note) => note.origin === undefined).length;
    if (chip.count !== standalone) {
      fail(
        "noteChipCountsRows",
        `the note chip says ${chip.count} but ${standalone} notes have rows of their own`
      );
    }
  },

  /**
   * `nestedCount` is what exists behind another row — and is ABSENT when nothing is.
   *
   * With nothing nested there is no second clause to render, and "· 0 on routes" is a
   * sentence about nothing.
   */
  nestedCountMatchesWhatIsHidden({ counts, notes }: ChipInput): void {
    const chip = counts.find((entry) => entry.kind === "note");
    if (chip === undefined) return;
    const nested = notes.filter((note) => note.origin !== undefined).length;
    if (nested === 0) {
      if (chip.nestedCount !== undefined) {
        fail("nestedCountMatchesWhatIsHidden", "nothing is nested, so the field must be absent");
      }
      return;
    }
    if (chip.nestedCount !== nested) {
      fail(
        "nestedCountMatchesWhatIsHidden",
        `the chip nests ${chip.nestedCount} but ${nested} notes were written on routes`
      );
    }
  },

  /** Only a note can hide inside a route. Nothing else has a container. */
  onlyNotesAreNested({ counts }: ChipInput): void {
    for (const entry of counts) {
      if (entry.kind === "note") continue;
      if (entry.nestedCount !== undefined) {
        fail("onlyNotesAreNested", `"${entry.kind}" reports a nested count and has nowhere to nest`);
      }
    }
  }
} as const;

/** What a cellar rule is given: one member's cellar response. */
export type CellarInput = { cellar: ListCellarResponse };

/**
 * A projection is not possession.
 *
 * The cellar is the surface that tells a member what they OWN. Wines met on a route
 * appear there as a group, and the moment anything totals them with the bottles the
 * app is claiming possession of wine that was drunk standing up at half past ten.
 */
export const CELLAR_RULES = {
  /** The group counts WINES. There are no bottles here to count. */
  projectionCountsWinesNotBottles({ cellar }: CellarInput): void {
    const projection = cellar.metOnRoutes;
    if (projection === undefined) return;
    if (typeof projection.wineCount !== "number") {
      fail("projectionCountsWinesNotBottles", "the projection publishes no wine count");
    }
    for (const field of ["bottles", "bottleCount"]) {
      if (field in projection) {
        fail("projectionCountsWinesNotBottles", `the projection carries "${field}"`);
      }
    }
  },

  /**
   * A met wine carries nothing that belongs to a bottle somebody owns.
   *
   * The absences are the contract: a client cannot render this row as a holding
   * because there is nothing on it to render.
   */
  metWineCarriesNoPossession({ cellar }: CellarInput): void {
    const forbidden = ["bottles", "paidPrice", "acquiredAt", "note", "entry"];
    for (const group of cellar.metOnRoutes?.groups ?? []) {
      for (const met of group.items) {
        for (const field of forbidden) {
          if (field in met) {
            fail(
              "metWineCarriesNoPossession",
              `a wine met at "${met.stopId}" carries "${field}", which belongs to a bottle somebody holds`
            );
          }
        }
      }
    }
  },

  /**
   * A met wine states where in the route it was.
   *
   * Sent rather than counted from the array: a stop that poured nothing contributes
   * no row, so position here is not position on the route.
   */
  metWineStatesItsStopOrdinal({ cellar }: CellarInput): void {
    for (const group of cellar.metOnRoutes?.groups ?? []) {
      for (const met of group.items) {
        if (typeof met.stopOrdinal !== "number") {
          fail("metWineStatesItsStopOrdinal", `a wine met at "${met.stopId}" states no position`);
        }
      }
    }
  },

  /** An estate name is a proper noun — canonical text, the same word in every locale. */
  placeNameIsCanonicalText({ cellar }: CellarInput): void {
    for (const group of cellar.metOnRoutes?.groups ?? []) {
      for (const met of group.items) {
        if (met.placeName?.source !== "canonical") {
          fail("placeNameIsCanonicalText", `a wine met at "${met.stopId}" names its place as a bare string`);
        }
      }
    }
  },

  /**
   * Provenance sits BESIDE possession, never instead of it.
   *
   * The route did not put the bottle in the cellar; the member bought it on the way
   * home. A holding with `firstMet` still carries what they own.
   */
  firstMetSitsBesidePossession({ cellar }: CellarInput): void {
    for (const holding of cellar.items) {
      if (holding.firstMet === undefined) continue;
      if (typeof holding.entry.bottles !== "number") {
        fail(
          "firstMetSitsBesidePossession",
          `holding "${holding.entry.wineId}" has provenance but no bottle count`
        );
      }
      if (!holding.firstMet.itineraryId || typeof holding.firstMet.stopOrdinal !== "number") {
        fail(
          "firstMetSitsBesidePossession",
          `holding "${holding.entry.wineId}" has provenance that names no route or position`
        );
      }
    }
  }
} as const;

/** What the first-met rule is given: every candidate meeting, and the one credited. */
export type FirstMetInput = {
  meetings: readonly CellarFirstMetContract[];
  credited: CellarFirstMetContract;
};

/**
 * A wine met on two routes credits the earlier DAY.
 *
 * The entire argument for a stop carrying a day. Ranked by the stop's date this is the
 * earlier afternoon; ranked by anything else available — the route's `createdAt`, the
 * note's — it is whichever route was WRITTEN UP first, so a day documented months late
 * steals credit from the day that earned it.
 */
export const FIRST_MET_RULES = {
  creditsTheEarlierDay({ meetings, credited }: FirstMetInput): void {
    const dated = meetings.filter((meeting) => meeting.date !== undefined);
    if (dated.length < 2) return;
    const earliest = [...dated].sort((a, b) => a.date!.localeCompare(b.date!))[0]!;
    if (credited.itineraryId !== earliest.itineraryId) {
      fail(
        "creditsTheEarlierDay",
        `first met credits "${credited.itineraryId}" but "${earliest.itineraryId}" happened on ` +
          `${earliest.date} — rank by the stop's day, never by when the route was written up`
      );
    }
  }
} as const;
