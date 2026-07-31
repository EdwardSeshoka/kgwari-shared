import { int } from "../random.mjs";
import { REGIONS, slug } from "../data.mjs";

/**
 * The wine regions, expanded from the curated list.
 *
 * `exonym` marks a place whose name differs by language — Bourgogne / Burgundy —
 * and `nameLanguage` says which one this row carries. Neither is on
 * `RegionContract`, which is a gap rather than a decision: it is real
 * localisation data with no wire representation yet.
 */
export function buildRegions() {
  const regions = REGIONS.map(([name, cc, country, parent, exonym, lang]) => ({
    id: `region_${slug(name)}`,
    name,
    country,
    countryCode: cc,
    regionType: "district",
    parentRegion: parent,
    ...(exonym ? { exonym, nameLanguage: lang } : {}),
    description: `${name} — ${country}.`,
    producerCount: int(12, 240),
    wineCount: int(60, 1400),
  }));
  const regionByName = new Map(regions.map((r) => [r.name, r]));

  return { regions, regionByName };
}
