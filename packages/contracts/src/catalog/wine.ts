import type {
  ProvenanceState,
  TrustBylineContract,
  VerdictWord,
} from "../trust/index.js";

export type WineBadgeContract = {
  label: string;
};

export type WineLocationContract = {
  area: string;
};

/**
 * Money moved to its own module — it is not a catalog concept. Cellar, events
 * and search all price things too, and a shared money type that lives inside
 * `catalog` invites each of them to declare their own.
 *
 * Re-exported here so existing `@edwardseshoka/contracts/catalog` importers keep
 * resolving. Note the shape CHANGED in 5.0.0: `amount` became
 * `amountMinorUnits`, and it now means cents rather than rands.
 *
 * @see {@link ../money!MoneyContract}
 */
import type { MoneyContract } from "../money/index.js";

export type { CurrencyCode, MoneyContract } from "../money/index.js";

/** Wine colour / style family. */
export type WineColorContract =
  | "red"
  | "white"
  | "rose"
  | "orange"
  | "sparkling"
  | "fortified";

/** Protected-origin systems, by country. */
export type WineOriginSystemContract =
  | "WO" // South Africa — Wine of Origin
  | "AOC" // France — Appellation d'Origine Contrôlée
  | "AOP" // France / EU — Appellation d'Origine Protégée
  | "DOC" // Italy — Denominazione di Origine Controllata
  | "DOCG" // Italy — …e Garantita
  | "DO" // Spain — Denominación de Origen
  | "DOCa" // Spain — …Calificada
  | "AVA" // USA — American Viticultural Area
  | "GI" // Australia — Geographical Indication
  | "Other";

/** A denormalized reference to a wine's appellation; the full record lives in provenance. */
export type WineAppellationRefContract = {
  id: string;
  name: string;
  system: WineOriginSystemContract;
};

/** One grape in a wine — the single varietal, or a component of a blend. */
export type GrapeBlendComponentContract = {
  grapeVarietyId: string;
  grapeName: string;
  percentage?: number;
};

/**
 * A wine as browsed and cellared — a single **vintage**. `id` is the
 * vintage-specific id ("rubicon-2018"); `wineLabelId` groups vintages under one
 * label ("rubicon"). Three-tier identity: Producer → WineLabel → WineVintage;
 * notes, verdicts, cellaring and requests all attach to this vintage.
 *
 * No public numeric score ever appears here — the editorial signal is the worded
 * `verdict`, the `provenance` state, the `source` byline and a `noteCount`.
 */
export type WineContract = {
  /** Vintage-specific id, e.g. "rubicon-2018". */
  id: string;
  /** Stable parent label id grouping all vintages, e.g. "rubicon". */
  wineLabelId?: string;
  /** Label name, e.g. "Rubicon". */
  name: string;
  estate?: string;
  producerId?: string;
  /** Harvest year. Absent for non-vintage / multi-vintage wines. */
  vintage?: number;
  /** Display form, used when non-numeric — "2018", "NV", "MV". */
  vintageDisplay?: string;
  /** @deprecated Compatibility alias for {@link vintage} (equals it). Prefer `vintage`. */
  year?: number;

  /** ISO country code, e.g. "ZA", "FR", "IT", "US". */
  countryCode?: string;
  region: string;
  regionId?: string;
  appellation?: WineAppellationRefContract;

  /** Style, e.g. "Bordeaux Blend", "Pinotage", "Cap Classique". */
  styleName?: string;
  color?: WineColorContract;
  /** Varietal (one component) or blend (many). */
  grapeBlend?: GrapeBlendComponentContract[];

  location?: WineLocationContract;
  imageUrl?: string;
  description?: string;
  price?: MoneyContract;
  badge?: WineBadgeContract;
  isFeatured?: boolean;

  // ── Editorial signal (Fade Yield) — intrinsic wine facts, shown wherever the
  //    wine appears (discover · detail · search), not just in a list. ──
  /** Kgwari's worded verdict — never a numeric score. */
  verdict?: VerdictWord;
  /** How backed the record is; drives the ProvenanceTag + "Request a taste". */
  provenance?: ProvenanceState;
  /** The backing byline — "Community knowledge", a verified estate, a distributor. */
  source?: TrustBylineContract;
  /** Member-notes count (a count, not a score) — e.g. 1,480. */
  noteCount?: number;
};
