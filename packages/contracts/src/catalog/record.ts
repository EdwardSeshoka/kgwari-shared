/**
 * The wine record — the deep document behind a wine, and the model that decides
 * what a member may do to each fact in it.
 *
 * The governing correction, and the reason this module exists: **a wine's facts
 * do not start empty.** Estate, region, ward, vintage, varietal, alcohol,
 * closure and format are matched from Wine of Origin, the bottle's own back
 * label and the SAWIS register at ingest, and are present from the first second
 * the record exists. An earlier model treated the record as a progress bar the
 * crowd fills in ("nine of ninety-two fields"), which framed a matched record as
 * an empty one and made a one-note page and a fourteen-hundred-note page look
 * like different pages. They are the same page.
 *
 * What an unclaimed record lacks is not knowledge. It is a voice, and the
 * handful of facts only the producer holds.
 *
 * Separate from {@link WineContract}, which is the card shape discover and
 * search render in lists. The record is fetched for the detail document only —
 * growing the card to carry ninety-odd fields would tax every list in the app
 * for one screen's benefit.
 *
 * ## Localisation
 *
 * No field on this record is a display string. Field identity travels as a
 * chrome key, values travel as {@link Measurement} / {@link YearRange} /
 * {@link ChromeText} / {@link CanonicalText}, and only genuinely authored prose
 * — an estate's essay, a member's note — travels as {@link NegotiatedText} with
 * the language it landed on. "14.21 %" is not a value; it is a number, a unit
 * and a decimal separator that is a comma for most of this catalogue's members.
 */

import type {
  MemberStatus,
  TrustTier,
  VerdictWord,
  WineClaimContract
} from "../trust/index.js";
import type {
  CanonicalText,
  ChromeText,
  Measurement,
  NegotiatedText,
  YearRange,
} from "../text/index.js";
import type {
  EstateSealKey,
  LockedSectionKey,
  RecordFieldKey,
  RecordGroupKey,
  RecordRoleKey
} from "./vocabulary/index.js";
import type { WineRegisterContract } from "./register.js";
import type { ClaimantAvailabilityContract } from "./availability.js";

/**
 * Who supplied one value. Named specifically rather than lumped into "verified"
 * or "unverified", because the difference between a certification body and an
 * imported trade database is exactly the difference a reader needs in order to
 * decide how much to trust a row.
 *
 * The display strings are the client's ("W.O.", "SAWIS", "Trade DB") — this is a
 * closed vocabulary and therefore chrome, rendered per locale from the enum.
 * Where a source has a specific instance, it travels in
 * {@link RecordFieldContract.sourceRef}.
 *
 *  - `wo`          Wine of Origin certification — the scheme, not a claim.
 *  - `sawis`       SA Wine Industry Information & Systems register.
 *  - `label`       The bottle's own back label, transcribed.
 *  - `db`          A trade database, imported and NOT verified by us. Say so.
 *  - `register`    Computed from member notes. Never a fact about the wine —
 *                  a fact about what members reported.
 *  - `member`      A member supplied this. Survives only for what members
 *                  genuinely supply (a reading, a colour); it lost the factual
 *                  rows it was never right to carry.
 *  - `estate`      Supplied by the producer who claimed the record.
 *  - `distributor` Supplied by the distributor who listed the record.
 *  - `editorial`   Authored by Kgwari. Rare by design and always marked.
 */
export type FieldSourceContract =
  | "wo"
  | "sawis"
  | "label"
  | "db"
  | "register"
  | "member"
  | "estate"
  | "distributor"
  | "editorial";

/**
 * Who *can* answer a field — which is a different question from who has. This is
 * the axis the record column is grouped by, and it is what makes the claim
 * asymmetry mechanical rather than a rule each client re-implements.
 *
 *  - `reference`      Matched at ingest from an outside source. Always has a
 *                     value. The member's job here is to CONFIRM OR DISPUTE it,
 *                     never to fill it in.
 *  - `estate_private` Only the producer holds it — soil, yield, fermentation,
 *                     yeast, new oak, production run, drink window. No outside
 *                     source has it and members are deliberately not asked to
 *                     guess: a member guessing the yield is noise entering a
 *                     record whose whole value is that it does not guess. Absent
 *                     until a producer claim, and the concrete thing a claim
 *                     unlocks.
 *  - `commercial`     Importer, format, stock. A distributor claim opens these
 *                     and only these — it can say where the bottle is, never
 *                     what the vineyard is.
 */
export type RecordFieldKind = "reference" | "estate_private" | "commercial";

/**
 * A value as the record holds it, never as a sentence.
 *
 * `Measurement` covers every number-with-a-unit (14.21 % ABV, 4.2 t/ha, 750 ml,
 * 18 months); `YearRange` covers drink and peak windows, whose years are
 * ordinals and must not be group-formatted; `ChromeText` covers closed
 * vocabularies (closure type, farming method); `CanonicalText` covers proper
 * nouns and identifiers (an estate name, a certificate number, a barcode).
 * `NegotiatedText` is the escape hatch for the few rows that are genuinely
 * prose, and its use should stay rare — a record made of prose is a record that
 * cannot be filtered, compared or searched.
 */
export type RecordFieldValue =
  | CanonicalText
  | ChromeText
  | Measurement
  | YearRange
  | NegotiatedText;

/**
 * The standing of a reference value under member scrutiny.
 *
 * `confirmations` is a count of members who have affirmed the value, not a score
 * and never rendered as one — it exists so a long-unchallenged row can
 * eventually read as settled. `disputed` means at least one open dispute; the
 * value stays visible while it is contested, because hiding a fact under review
 * is worse than showing a fact that is being argued about.
 */
export type FieldVerificationContract = {
  confirmations: number;
  disputed: boolean;
  /** Whether the requesting member has already confirmed. Confirmation is idempotent. */
  confirmedByMe?: boolean;
};

/**
 * One row of the record.
 *
 * Modelled as a row with a `kind` rather than an optional property on a flat
 * object, because an estate-private field has to be **enumerable while empty**:
 * the detail page lists the facts it is waiting on the estate for, by name, with
 * no call to action attached. An absent property cannot render that, and the
 * alternative — each client hardcoding the list — guarantees drift.
 *
 * So the same `key` carries a field through its whole life: pending
 * (`kind: "estate_private"`, no `value`) becomes answered (same key, a `value`,
 * `source: "estate"`) the moment a producer claims.
 */
export type RecordFieldContract = {
  /**
   * Stable machine key AND the chrome key the client renders the label from.
   * There is no `label` field on purpose: the set is closed, so sending the word
   * would hardcode English into every row of every record — and being closed is
   * now stated, so a typo fails to compile and the full set can be listed
   * against a locale catalogue.
   */
  key: RecordFieldKey;
  /**
   * ABSENT means nobody who could answer has: for `estate_private`, the page is
   * waiting on the estate. Absence is a statement, not missing data.
   */
  value?: RecordFieldValue;
  /** Who supplied {@link value}. Absent exactly when `value` is. */
  source?: FieldSourceContract;
  /** The specific instance of the source — a certificate number, a database name. */
  sourceRef?: CanonicalText;
  kind: RecordFieldKind;
  /**
   * Present on `reference` rows, which are the only ones a member may argue
   * with. Absent elsewhere — there is nothing to confirm about a fact the estate
   * has not supplied yet, and an estate's own account of its own cellar is not
   * put to a vote.
   */
  verification?: FieldVerificationContract;
};

/**
 * A titled run of rows — "Matched at ingest", "Only the estate can answer",
 * "Answered by the distributor". `noteKey` is the group's one-line explanation
 * of where its contents came from, which is the honest version of the progress
 * bar this model replaced.
 *
 * Both are localisation keys, not copy: the group set is closed and the server
 * never sends translated text.
 */
export type RecordFieldGroupContract = {
  key: RecordGroupKey;
  /**
   * The heading, DERIVED from the key by construction — a template literal
   * type, so `record.group.matched` type-checks and `record.group.mtached` does
   * not. Carried on the wire so a client need not compute it, but it can no
   * longer disagree with the key it came from. `recordGroupLabelKey` builds it.
   */
  labelKey: `record.group.${RecordGroupKey}`;
  noteKey?: `record.group.${RecordGroupKey}.note`;
  fields: RecordFieldContract[];
};

/**
 * A section of the record that a claim has not bought yet — the estate's own
 * account on a community record, and the same section on a distributor-claimed
 * one, because a claim on commerce is not a claim on the wine.
 *
 * Keyed rather than composed, with `params` for the interpolations, so the
 * sentence "Môrester's name is here because Wine of Origin certified it, not
 * because Môrester said so" can put the estate name where each language wants
 * it. Concatenating a translated fragment either side of a proper noun is the
 * classic way to produce copy that reads correctly in exactly one language.
 */
export type LockedSectionContract = {
  key: LockedSectionKey;
  titleKey: `record.locked.${LockedSectionKey}.title`;
  /**
   * The body differs by WHO holds the claim, which is the asymmetry this page
   * exists to make legible: on a community record the estate has simply not
   * spoken, while on a distributor-claimed one somebody accountable has arrived
   * and still cannot answer.
   */
  bodyKey:
    | `record.locked.${LockedSectionKey}.body`
    | `record.locked.${LockedSectionKey}.distributorBody`;
  /** Interpolations — typically the estate name. Values are canonical or numeric. */
  params?: Readonly<Record<string, string | number>>;
  /** Who could open it. Always "producer" today; typed for the same reason `kind` is. */
  needs: WineClaimContract["kind"];
};

/**
 * The estate's own account. Present only under a producer claim — a distributor
 * claim never opens it.
 *
 * All prose, and the one place on the record where `languageTag` really earns
 * its keep: this is the estate's own writing, so serving an English fallback to
 * an Afrikaans member without saying so misrepresents whose words they are
 * reading and in what language they were written.
 */
export type EstateVoiceContract = {
  headline: NegotiatedText;
  standfirst: NegotiatedText;
  essay: NegotiatedText[];
  /** The cellarmaster, by name — canonical, with their role as a chrome key. */
  bylineName: CanonicalText;
  bylineRoleKey?: RecordRoleKey;
  /** The cellarmaster's line, pulled out as its own quote. */
  quote?: NegotiatedText;
  seals?: EstateSealContract[];
};

/**
 * A certification or membership the estate supplied — the Old Vine Project, the
 * Cape Winemakers Guild, WIETA. The body's name is canonical; `sinceYear` and
 * `auditedYear` are ordinals sent as digits, never as "Member since 2011".
 */
export type EstateSealContract = {
  key: EstateSealKey;
  name: CanonicalText;
  sinceYear?: number;
  auditedYear?: number;
};

/**
 * The community lede: the most-saved note, promoted in its author's exact words.
 * Sourced, never authored — on an unclaimed record the page reads in a member's
 * voice, not Kgwari's.
 */
export type FeaturedNoteContract = {
  noteId: string;
  /** The author's name is canonical; their tier or status renders as chrome. */
  authorName: CanonicalText;
  authorTier?: TrustTier;
  authorStatus?: MemberStatus;
  text: NegotiatedText;
  saveCount: number;
};

/** One vintage in the vertical — the verdict, its weight, and a one-line read. */
export type WineVerticalEntryContract = {
  wineVintageId: string;
  /** An ordinal. Interpolate as plain digits — never through a grouping formatter. */
  vintage: number;
  /** The enum value, which IS the chrome key. See {@link ChromeText}. */
  verdict?: VerdictWord;
  noteCount: number;
  note?: NegotiatedText;
  /** True for the vintage being viewed. */
  isCurrent?: boolean;
};

/**
 * The full detail document for one vintage.
 *
 * Everything that varies with note count lives in {@link register}; everything
 * that varies with the claim lives in {@link groups} and {@link availability}.
 * Nothing varies with both, which is what keeps provenance binary.
 */
export type WineRecordContract = {
  /** Vintage-specific id — matches {@link WineContract.id}. */
  wineVintageId: string;
  /** Absent on a community record. */
  claimedBy?: WineClaimContract;

  /** The record proper, in display order. */
  groups: RecordFieldGroupContract[];
  /** Sections still shut, with the reason. Empty once a producer has claimed. */
  locked: LockedSectionContract[];

  /** The community layer — the only part that moves with note count. */
  register: WineRegisterContract;

  featuredNote?: FeaturedNoteContract;
  estateVoice?: EstateVoiceContract;

  /** Price and how to ask for the bottle. Present only when a claim is. */
  availability?: ClaimantAvailabilityContract;

  /**
   * The same label across vintages, each with its own verdict and weight. Uses
   * {@link WineContract.wineLabelId} for the grouping.
   */
  vertical?: WineVerticalEntryContract[];

  /** Members holding this vintage. A number — the client owns the plural rule. */
  cellarCount?: number;
  /** Present when this record has been read for a member. */
  inMyCellar?: boolean;
};
