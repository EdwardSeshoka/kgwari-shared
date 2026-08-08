/**
 * The register — what the community found, aggregated. The only layer of a wine
 * record that moves with note count.
 *
 * This is deliberately not a state machine. A record with one note and a record
 * with fourteen hundred are the same page: the identity is matched at ingest and
 * unchanged, and it is only the register that thickens. Sections switch on as
 * evidence arrives, which is a property of one state rather than a second one.
 *
 * Where a threshold governs (a spread needs enough answers to be worth drawing;
 * a disagreement section needs enough to disagree), the THRESHOLD IS SERVER
 * POLICY and shows up here as an absent field, never as a number the client
 * compares against. A client that hardcodes "25" is a client that has to ship to
 * change editorial judgement.
 *
 * ## Localisation and search
 *
 * Every word in the register comes from a CLOSED vocabulary — the metrics, their
 * five rungs, the tasting descriptors, the aromas — so all of it travels as
 * chrome keys and none of it as text. That is not only a translation decision:
 * it is what makes the register searchable. The index holds `aroma.fynbos_smoke`
 * and the member sees their own language, so browsing by aroma works in every
 * locale without the index carrying one translated word. An aroma sent as text
 * can only ever be searched in the language it was authored in.
 */

import type { VerdictWord } from "../trust/index.js";
import type { NegotiatedText } from "../text/index.js";
import type {
  AromaKey,
  ColourReadingKey,
  TastingMetricKey,
  TastingWordKey
} from "../vocabulary/index.js";

/** The four movements of a structured tasting, in tasting order. */
export type RegisterGroupKey = "appearance" | "nose" | "palate" | "conclusion";

/**
 * A metric answered on an ordinal scale — tannin, body, finish.
 *
 * `key` is both the metric's identity and its chrome key; `wordKey` is how the
 * averaged reading should read ("fine_grained_high"), because the register
 * reports in words and those words are a closed set. `value` is the mean on the
 * same 1–5 scale the picker offers, sent as a number so it is never rendered
 * with the wrong decimal separator — and never rendered as a score.
 */
export type RegisterScaleMetricContract = {
  shape: "scale";
  key: TastingMetricKey;
  wordKey: TastingWordKey;
  value: number;
  /** How many notes answered this metric. Metrics differ — not everyone answers all. */
  noteCount: number;
  /** Chrome keys for the five rungs, low → high. Empty string for unlabelled middles. */
  scaleWordKeys: [string, string, string, string, string];
  /**
   * Where the answers actually fell, as percentages of `noteCount`, low → high.
   *
   * ABSENT means too few notes for a spread to mean anything — render the single
   * mark instead. One reading is a reading, not a consensus, and drawing a
   * distribution behind it would claim agreement that does not exist.
   */
  distribution?: [number, number, number, number, number];
  /**
   * The middle half of the answers, and the mark that belongs over it.
   *
   * Absent for the same reason {@link distribution} is: too few readings for a
   * spread to be a claim about anything. A metric may legitimately carry a
   * distribution and no spread — five bars is a shape, whereas quartiles off five
   * readings are arithmetic pretending to be a statistic.
   */
  spread?: RegisterSpreadContract;
  /** Set when there is exactly one reading: whose it is. A proper noun. */
  singleReadingBy?: string;
};

/**
 * Where the middle half of the register fell, and the median inside it.
 *
 * ## One object, because the two must never arrive apart
 *
 * The band is the 25th to 75th percentile and the mark is the 50th. Send the band
 * alone and a render edge has to mark it with something — and the only number to
 * hand would be {@link RegisterScaleMetricContract.value}, which is the MEAN. A
 * quartile band under a mean mark is two different statistics drawn on one rail:
 * they disagree on any skewed register, and the page then shows a mark sitting
 * outside its own middle half with no way for a reader to know why.
 *
 * So they travel together or not at all. Two optional fields that must agree are
 * two fields that eventually will not — the same argument that keeps this package
 * off the legacy `title` + `titleLanguage` pair.
 *
 * ## The mean does not go away, and is not this
 *
 * `value` stays, because `wordKey` is derived from it: the register reports in
 * words, and the word is how the AVERAGED reading reads. What changes when this is
 * present is only what the scale draws — band from `middleHalf`, mark at
 * `median` — and a client must label that mark for what it is. Labelling a median
 * "average" is the same misreport in the other direction.
 *
 * ## Never synthesised
 *
 * A median cannot be derived from a mean and a count, and anything that tries is
 * inventing a number with no reading behind it. A composer that has not got the
 * readings to compute both omits this object; it does not estimate one of them.
 */
export type RegisterSpreadContract = {
  /**
   * The 25th and 75th percentiles, low then high, on the same 1–5 scale as
   * {@link RegisterScaleMetricContract.value}.
   *
   * Percentiles and never the minimum and maximum. The extremes of a tasting
   * register are one member each — the person who found no tannin at all and the
   * person who found nothing but — and a band drawn to them describes those two
   * people rather than the room. The same choice
   * {@link ../catalog!PaidPriceBandContract} makes about price, for the same
   * reason.
   */
  middleHalf: [number, number];
  /**
   * The 50th percentile — the mark.
   *
   * Inside `middleHalf` by construction. A consumer need not check that and must
   * not correct it: a median outside its own quartiles is a composer bug, and a
   * client that silently clamps it hides the bug rather than the value.
   */
  median: number;
};

/**
 * A metric answered by picking one of several named options — colour,
 * development, readiness. No mean exists for these; the answer is the split.
 */
export type RegisterChoiceMetricContract = {
  shape: "choice";
  /**
   * NOT a closed union, unlike every other key on this contract — and
   * deliberately, because nothing has produced a choice metric yet. Closing a
   * set on zero instances would mean inventing one, and an invented vocabulary
   * is worse than an open string: it looks authoritative. Close this the day the
   * first choice metric lands.
   */
  key: string;
  /** The leading choice, as its chrome key. */
  wordKey: TastingWordKey;
  noteCount: number;
  choices: RegisterChoiceContract[];
};

export type RegisterChoiceContract = {
  /** Chrome key for the option — the client renders the word. */
  key: string;
  percentage: number;
};

export type RegisterMetricContract =
  | RegisterScaleMetricContract
  | RegisterChoiceMetricContract;

export type RegisterGroupContract = {
  key: RegisterGroupKey;
  metrics: RegisterMetricContract[];
};

/** Primary is fruit and flower; secondary is winemaking; tertiary is age. */
export type AromaTier = "primary" | "secondary" | "tertiary";

/**
 * One aroma and how many notes named it. A count of mentions, not a score.
 *
 * `key` is a controlled-vocabulary chrome key (`"aroma.wild_plum"`), which is
 * the same key the search index holds — see this module's header.
 */
export type AromaMentionContract = {
  key: AromaKey;
  tier: AromaTier;
  mentions: number;
};

/**
 * Colour as record metadata — a reading with a swatch as evidence, carrying the
 * number of readings behind it so it never reads as a verdict.
 */
export type ColourReadingContract = {
  /** Chrome key from the colour vocabulary — "colour.deep_garnet". */
  readingKey: ColourReadingKey;
  readingCount: number;
  /** Hex, for the swatch gradient. Presentation data, but it belongs to the wine. */
  coreHex?: string;
  rimHex?: string;
};

/**
 * The distribution behind the verdict — the "48 % call it Essential" line, and
 * the "73 % put it at worth knowing or better" summary. Ordered best → worst,
 * matching {@link VerdictWord}.
 *
 * The verdict travels as the enum value, which IS its chrome key: because the
 * set is closed, the whole distribution reads in every locale with no
 * translation pipeline at all.
 */
export type VerdictDistributionEntryContract = {
  verdict: VerdictWord;
  percentage: number;
};

/**
 * The above-the-fold summary, as DATA rather than the sentence "73 % put it at
 * worth knowing or better."
 *
 * That sentence is three localisation faults at once: it concatenates a
 * percentage with a translated verdict word, it hardcodes English word order,
 * and the verdict inside it is an enum that must render per locale. Sent this
 * way, the client composes one full-sentence key and gets all three right.
 */
export type VerdictSummaryContract = {
  /** The rung the summary counts from, inclusive. */
  atOrAbove: VerdictWord;
  percentage: number;
};

/**
 * A named split in the register — the section that opens when enough members
 * disagree about the same thing to make the disagreement the interesting part.
 * A page that reports only the average hides it.
 */
export type RegisterDisagreementContract = {
  /**
   * What they are splitting over, as the aroma or descriptor key they are
   * splitting about — the same vocabulary the split entries use.
   */
  /**
   * Open for the same reason as the choice metrics: the seed produces no
   * disagreements yet, so there is no real set to close. Close it with the
   * first one.
   */
  subjectKey: string;
  /** Curated prose; the one genuinely authored field in the register. */
  body?: NegotiatedText;
  /** How the naming splits. Each entry is a vocabulary key, not a word. */
  split: RegisterChoiceContract[];
  /** Notes that named the subject at all, of {@link WineRegisterContract.noteCount}. */
  namedBy: number;
};

/**
 * Everything the community has said about one vintage, aggregated.
 *
 * INVARIANT: a claim does not move any of this. The estate can supply the cellar
 * record and write the essay; the verdict still comes from the members.
 */
export type WineRegisterContract = {
  noteCount: number;
  /**
   * ISO-8601. When the first note on this vintage was filed.
   *
   * ## What it is for
   *
   * A register of 1,284 notes has plainly been open longer than one of ten, and
   * "reading since 2021" is the fact that says so. `noteCount` alone cannot: a
   * thick register and a viral week look identical through it, and they are not
   * the same claim about a wine.
   *
   * ## A DATE, and the duration is the render edge's
   *
   * "Five years" is composed from this and the clock, in the reader's locale, with
   * the reader's plural rules — exactly as {@link CellarSummaryContract.keepingSince}
   * is and for the same reason. A server that sends "5 years" has hardcoded English
   * and pinned a number that goes stale on its own anniversary.
   *
   * ## Absent means no notes, never "unknown"
   *
   * A register with `noteCount: 0` has no first note to date, and that is the only
   * case this is absent in. It is not an optional the composer may skip when the
   * timestamp is inconvenient to reach: a client cannot tell a missing date from a
   * missing corpus, and the page then says nothing where it should say the
   * register is empty.
   */
  firstFiledAt?: string;
  verdict?: VerdictWord;
  /** Absent until enough notes for the split to be worth stating. */
  verdictDistribution?: VerdictDistributionEntryContract[];
  verdictSummary?: VerdictSummaryContract;
  groups: RegisterGroupContract[];
  aromas: AromaMentionContract[];
  colour?: ColourReadingContract;
  /** Absent until the register is thick enough to have an argument in it. */
  disagreement?: RegisterDisagreementContract;
};
