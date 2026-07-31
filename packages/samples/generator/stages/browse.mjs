import { canonical, chrome, negotiated } from "../text.mjs";
import { VERDICTS } from "@edwardseshoka/contracts/trust";

import { slug } from "../data.mjs";

/**
 * The ways into the catalogue offered before anything is typed.
 *
 * WHICH ways exist is editorial and now a closed key on the contract; what is
 * generated here is only the tally behind each one.
 */
export function buildBrowse({ regions, wines, corpus }) {
  const topRegions = [...regions].sort((a, b) => b.wineCount - a.wineCount).slice(0, 8);
  const browse = [
    {
      key: "region",
      items: topRegions.map((r) => ({
        id: slug(r.name),
        label: r.exonym ? negotiated(r.name, r.nameLanguage) : canonical(r.name),
        count: r.wineCount,
        query: r.name,
      })),
    },
    {
      key: "verdict",
      items: VERDICTS.map((v) => ({
        id: slug(v),
        label: chrome(v),
        count: corpus.filter((c) => c.verdict === v).length,
        query: v,
      })),
    },
    {
      key: "country",
      items: [...new Set(regions.map((r) => r.country))].slice(0, 8).map((c) => ({
        id: slug(c),
        label: canonical(c),
        count: wines.filter((w) => regions.find((r) => r.id === w.regionId)?.country === c).length,
        query: c,
      })),
    },
  ];

  return browse;
}
