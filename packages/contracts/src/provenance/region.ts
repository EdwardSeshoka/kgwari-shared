/**
 * A wine region — rich enough to drive any region UI on its own, and now aware
 * of a global hierarchy: Western Cape → Coastal Region → Stellenbosch; Bordeaux
 * → Médoc → Pauillac. Walk up via `parentRegionId`; `regionType` says which rung.
 * Relationships (its producers, its wines) are composed at the screen tier.
 */
export type RegionType =
  | "country"
  | "province"
  | "region"
  | "district"
  | "ward"
  | "appellation";

export type RegionContract = {
  id: string;
  name: string;
  /** Display country label, e.g. "South Africa". */
  country: string;
  /** ISO-ish app country code, e.g. "ZA". */
  countryCode?: string;
  province?: string;
  /** Parent in the region hierarchy. */
  parentRegionId?: string;
  regionType?: RegionType;
  imageUrl?: string;
  description?: string;
  /**
   * True when this place is known by a different name in another language —
   * Bourgogne / Burgundy, Toscana / Tuscany.
   *
   * It exists because a region's name is the ONE catalogue field that is
   * genuinely translatable, and a client cannot tell a translated name from an
   * untranslated one without being told. Search projects an exonymous region's
   * title as `NegotiatedText` and a single-name place as `CanonicalText`, so
   * this flag is what decides which claim the row makes.
   */
  exonym?: boolean;
  /**
   * BCP 47 tag of the name in {@link name}. Only meaningful with `exonym`.
   *
   * Without it, a fallback is indistinguishable from a translation — serving
   * "Burgundy" to a French member reads as though French were what we had.
   */
  nameLanguage?: string;
  producerCount: number;
  wineCount: number;
};
