/**
 * Every field a wine record can carry, and which layer owns it.
 *
 * **The set is closed, and now says so.** It was `key: string`, which meant the
 * nineteen fields a detail page renders had no declaration anywhere — a typo was
 * a missing translation at runtime, and nothing could list what the `fr-FR`
 * catalogue still owed. Split by owner because that is the axis the page groups
 * by, and it makes the claim asymmetry mechanical rather than a rule each client
 * re-implements.
 */

/**
 * Matched at ingest from an outside source. ALWAYS has a value — a member's job
 * here is to confirm or dispute it, never to fill it in.
 */
export const REFERENCE_FIELDS = [
  "estate",
  "region",
  "appellation",
  "vintage",
  "varietal",
  "colour",
  "alcohol",
  "closure",
  "format",
  "certificateNumber"
] as const;

/**
 * Only the producer holds these. No outside source has them, and members are
 * deliberately not asked to guess: a member guessing a yield is noise entering a
 * record whose whole value is that it does not guess. Absent until a producer
 * claim, and the concrete thing a claim unlocks.
 */
export const ESTATE_PRIVATE_FIELDS = [
  "soil",
  "yield",
  "fermentation",
  "yeast",
  "newOak",
  "productionRun",
  "drinkWindow"
] as const;

/**
 * Opened by a distributor claim and only a distributor claim — it can say where
 * the bottle is, never what the vineyard is.
 */
export const COMMERCIAL_FIELDS = ["importer", "stock"] as const;

export type ReferenceFieldKey = (typeof REFERENCE_FIELDS)[number];
export type EstatePrivateFieldKey = (typeof ESTATE_PRIVATE_FIELDS)[number];
export type CommercialFieldKey = (typeof COMMERCIAL_FIELDS)[number];

/** Any field on a record. Also the chrome key its label renders from. */
export type RecordFieldKey =
  | ReferenceFieldKey
  | EstatePrivateFieldKey
  | CommercialFieldKey;

export const RECORD_FIELDS: readonly RecordFieldKey[] = [
  ...REFERENCE_FIELDS,
  ...ESTATE_PRIVATE_FIELDS,
  ...COMMERCIAL_FIELDS
];
