/**
 * A wine producer / estate. `regionName` is a denormalized scalar for display;
 * the full region is fetched from the provenance region api when needed.
 */
export type ProducerContract = {
  id: string;
  name: string;
  /** ISO country code, e.g. "ZA", "FR" — for global data quality. */
  countryCode?: string;
  regionId?: string;
  regionName?: string;
  imageUrl?: string;
  description?: string;
  /**
   * The year the estate was founded, when known.
   *
   * An ORDINAL, sent as digits — it must not go through a grouping number
   * formatter, which renders 1693 as "1 693" in French. Optional because most
   * producers have no recorded founding date, and the estate meta line is built
   * to read without one.
   */
  foundedYear?: number;
  wineCount: number;
};
