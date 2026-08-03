import type { CanonicalText } from "../text/index.js";

/**
 * Trust, provenance and verdict — the cross-cutting "how backed is this record,
 * and what does Kgwari say about it" vocabulary. Shared by wines, doorways,
 * events, room activity and editorial, so the three marks, the three provenance
 * states and the verdict word never drift apart between features.
 *
 * Introduced for the Fade Yield model. Several decisions are flagged inline —
 * search "DECISION:".
 */

/**
 * The account-verification tier that renders a TrustMark. A mark ALWAYS means
 * verified; regular members carry no tier. The three are kept deliberately
 * distinct — a professional's word (gold seal), a producer's (filled burgundy
 * crest) and a distributor's (outline crest) must never be mistaken for one
 * another.
 *
 * Canonical trust vocabulary (unified 2026-07): TrustTier is exactly the three
 * verified {@link MemberProfileType}s that earn a mark — professional · producer
 * · distributor. A member (profileType "enthusiast") earns no tier; their
 * standing is a {@link MemberStatus} word instead.
 */
export type TrustTier = "professional" | "producer" | "distributor";

/**
 * A member's standing, shown as a burgundy STATUS WORD — never a mark. Status
 * and verification are two different visual languages: a member never renders a
 * TrustMark, and a verified account never renders a status word.
 *
 * The ladder is "enthusiast → collector"; "collector" is an upgrade earned from
 * member activity (reviews, cellar, contributions), assigned by the system.
 */
export type MemberStatus = "enthusiast" | "collector";

/**
 * The account persona chosen at business onboarding — finer-grained than the
 * {@link TrustTier} mark it earns. Several personas share one mark: a restaurant,
 * a floor sommelier and a wine club all pour & sell (gold professional mark); an
 * estate and an independent winemaker both make wine (producer crest); an
 * importer and a distributor both bring wine to market (distributor crest).
 * "sommelier" is the individual; "venue" is the establishment.
 */
export type BusinessPersona =
  | "estate"
  | "winemaker"
  | "importer"
  | "distributor"
  | "sommelier"
  | "venue"
  | "wine_club";

/** The verification mark each business persona earns. The single source of truth. */
export const personaTier: Record<BusinessPersona, TrustTier> = {
  estate: "producer",
  winemaker: "producer",
  importer: "distributor",
  distributor: "distributor",
  sommelier: "professional",
  venue: "professional",
  wine_club: "professional",
};

/**
 * Who may stand behind a record. A claim is always made by a verified business
 * account, so this is exactly the two {@link TrustTier}s that own a wine rather
 * than merely taste one — a professional pours, they do not claim.
 */
export type ClaimantKind = Extract<TrustTier, "producer" | "distributor">;

/**
 * An accepted claim on a wine record: who stands behind it, and since when.
 *
 * The claimant's `kind` decides what the claim unlocks, and the asymmetry is the
 * point. A producer claim opens the estate's own voice — the essay, the
 * cellarmaster, the estate-private cellar facts. A distributor claim opens
 * commerce and nothing else: it can say where the bottle is, never what the
 * vineyard is. See {@link RecordFieldKind}.
 *
 * INVARIANT: a claim buys a voice, never the verdict. The verdict is computed
 * from member notes in every state and a claim does not move it.
 */
export type WineClaimContract = {
  kind: ClaimantKind;
  /**
   * The claimant — the estate, or the distributor.
   *
   * `CanonicalText` rather than a bare string, like every other proper noun on
   * the wire. The carrier is what says "this is the same word in every locale,
   * do not translate it", and a name that does not say so is a name some client
   * will eventually try to localise.
   */
  name: CanonicalText;
  /** Set when the claimant is a producer already in the provenance catalogue. */
  producerId?: string;
  /** ISO-8601. When the claim was accepted, not when it was requested. */
  claimedAt: string;
};

/**
 * How backed a record is — **binary**, because the thing it describes is binary:
 * either somebody accountable has claimed the record or nobody has.
 *
 * This is a projection of {@link WineClaimContract}, never an independent field:
 * a record is "claimed" exactly when a claim exists. Servers derive it, clients
 * read it, and nothing writes it directly — which is why the claimant kind lives
 * on the claim and not in this union.
 *
 * CHANGED in 6.0.0. It was `"community" | "listed" | "verified"`, which folded
 * two independent axes together: whether anyone is accountable (binary) and how
 * much the community has said (a continuum, and not a provenance question at
 * all). "listed" was never a third provenance — it was a distributor claim
 * wearing a middle state's clothes, so it moves to `claimedBy.kind`.
 *
 * NOTE: "community" does not mean thin, unknown or unverified. A wine's facts
 * are matched from Wine of Origin, the back label and the SAWIS register at
 * ingest and are present from the first second the record exists. What an
 * unclaimed record lacks is not knowledge — it is a voice. See
 * {@link FieldSourceContract}.
 */
export type ProvenanceState = "community" | "claimed";

/**
 * The author line that carries trust: a name plus EITHER a verification `tier`
 * (renders a mark) OR a member `status` word — never both. `role` is a plain
 * descriptor rendered after the name ("sommelier", "verified producer",
 * "1,480 member notes"). The name is the canonical identifier and must never be
 * truncated to an ellipsis on the client.
 *
 * INVARIANT: `tier` and `status` are mutually exclusive (verification vs standing).
 */
export type TrustBylineContract = {
  name: string;
  tier?: TrustTier;
  status?: MemberStatus;
  role?: string;
  href?: string;
};

/**
 * The verdict — a worded judgement on a wine, never a numeric score. One
 * 4-level ordinal scale, shared by the member review picker ("How did it land?")
 * and the house / aggregate verdict shown in Discover, kept identical so a chip
 * scans the same wherever it appears. Ordered best → worst; "Unforgettable" is
 * the top rung and rarely awarded. Extend only with deliberate editorial intent
 * (do not switch to a free string).
 *
 * CHANGED in 7.0: the fifth rung, "Not One I'd Revisit", is gone.
 *
 * It was retired in the register design, and the reason is editorial rather than
 * technical. Every other rung says what a wine IS worth — revisiting, knowing,
 * a discovery. The fifth said only what a member would not do again, which is a
 * fact about an evening rather than about a bottle, and it invited the one thing
 * a worded scale exists to avoid: a bottom to sort toward. A wine somebody did
 * not care for is a wine with a note and no verdict, and
 * {@link ../social!TastingNoteContract.verdict} has always allowed exactly that.
 *
 * Consumers that stored the retired word must map it — to no verdict, not to
 * the new bottom rung. "An Interesting Discovery" is a compliment.
 */
export type VerdictWord =
  | "Unforgettable"
  | "Essential"
  | "Worth Revisiting"
  | "An Interesting Discovery";

/** The verdict type used across contracts — the fixed {@link VerdictWord} set. */
export type Verdict = VerdictWord;

/**
 * All verdict rungs, best → worst — the ordinal source of truth.
 *
 * The ORDER is the point, and it is why this exists as a value rather than
 * living only in the type above. "Ordered best → worst" was previously stated in
 * a doc comment here and implemented as a separate array in the backend, which
 * is two declarations of one fact: any ranking that sorts by verdict — the
 * catalogue's "worth opening now", a search relevance tiebreak, a register's
 * distribution — has to know this order, and each one re-deriving it is a chance
 * for two of them to disagree about which verdict outranks which.
 *
 * `as const` so the array cannot be reordered by accident, and so `indexOf`
 * yields the rank directly.
 */
export const VERDICTS = [
  "Unforgettable",
  "Essential",
  "Worth Revisiting",
  "An Interesting Discovery"
] as const satisfies readonly VerdictWord[];
