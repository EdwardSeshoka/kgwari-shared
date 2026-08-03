import { canonical, chrome, negotiated } from "../text.mjs";
import {
  AROMAS_RED,
  AROMAS_WHITE,
  CLOSURES,
  FERMENTS,
  SOILS,
  TASTING_SCALES,
} from "@edwardseshoka/contracts/catalog";
import { VERDICTS } from "@edwardseshoka/contracts/trust";

import { curated } from "../curated.mjs";
import { registerFromNotes } from "../register.mjs";
import { int, pick, rnd, spread } from "../random.mjs";
import { recordGroupLabelKey, recordGroupNoteKey } from "@edwardseshoka/contracts/catalog";

import { slug } from "../data.mjs";

/**
 * The deep record behind each wine — the biggest stage by far.
 *
 * Reference rows are matched at ingest and always answered; estate-private rows
 * are enumerable while EMPTY, because the detail page lists what it is waiting
 * on the estate for by name. The overlay carries the only things no algorithm
 * can invent: an estate's own essay, a cellarmaster's line, a member's note.
 */
export function buildRecords({ wines, regions, producers, notes }) {
  const notesByWine = new Map();
  for (const note of notes) {
    if (!notesByWine.has(note.wineVintageId)) notesByWine.set(note.wineVintageId, []);
    notesByWine.get(note.wineVintageId).push(note);
  }


  /**
   * The record model, as a table.
   *
   * This is the piece that makes the fixture maintainable: a reference row is a
   * pure function of the wine and the source that matched it, so adding a field
   * to `WineRecordContract` is one row here and all 93 records gain it. Nothing
   * in this table can produce an `estate_private` row, and nothing outside it can
   * produce a `reference` one — the taxonomy is enforced by construction rather
   * than by care.
   *
   * Values are carriers, never display strings: `measurement` for anything with a
   * unit, `yearRange` for windows, `chrome` for closed vocabularies, `canonical`
   * for proper nouns. See `@edwardseshoka/contracts/text`.
   */
  const measurement = (value, unitKey, fractionDigits) => ({
    source: "measurement",
    value,
    unitKey,
    ...(fractionDigits === undefined ? {} : { fractionDigits }),
  });
  const yearRange = (from, to) => ({ source: "yearRange", from, to });

  const camel = (s) =>
    slug(s).replace(/-(.)/g, (_, c) => c.toUpperCase());


  /** ABV sits in a believable band for the style, and never moves for a given wine. */
  const abvOf = (w) =>
    w.color === "white"
      ? 11 + spread(`${w.id}abv`, 0, 25) / 10
      : 12.5 + spread(`${w.id}abv`, 0, 25) / 10;

  /**
   * Reference rows: the field, the source that matched it, and how to read it off
   * the wine. A row returning null is a fact this wine's origin system does not
   * carry — a certificate number exists under Wine of Origin and not under an AVA.
   */
  const REFERENCE_FIELDS = [
    ["estate", "wo", (w) => canonical(w.estate)],
    ["region", "wo", (w) => canonical(w.region)],
    ["appellation", "wo", (w) => (w.appellation ? canonical(w.appellation.name) : null)],
    ["vintage", "wo", (w) => (w.vintage ? measurement(w.vintage, "unit.vintageYear") : null)],
    // The key IS the chrome key — no string transform, so a renamed grape
    // cannot silently become a key with no catalog entry behind it.
    ["varietal", "label", (w) => (w.grapeBlend?.[0] ? chrome(w.grapeBlend[0].grapeVarietyId) : null)],
    ["colour", "label", (w) => (w.color ? chrome(`wineColour.${w.color}`) : null)],
    ["alcohol", "label", (w) => measurement(Math.round(abvOf(w) * 10) / 10, "unit.percentAbv", 1)],
    ["closure", "label", (w) => chrome(CLOSURES[spread(`${w.id}cl`, 0, CLOSURES.length - 1)])],
    ["format", "label", () => measurement(750, "unit.millilitre")],
    ["certificateNumber", "sawis", (w) =>
      w.appellation?.system === "WO"
        ? canonical(`W.O. cellar ${spread(`${w.id}cert`, 10, 99)}/${spread(`${w.id}cert2`, 100, 999)}`)
        : null],
  ];

  /** The seven only the producer holds, and how a claim answers each. */
  const PRIVATE_FIELDS = [
    ["soil", (w) => chrome(SOILS[spread(`${w.id}so`, 0, SOILS.length - 1)])],
    ["yield", (w) => measurement(spread(`${w.id}yi`, 30, 90) / 10, "unit.tonnesPerHectare", 1)],
    ["fermentation", (w) => chrome(FERMENTS[spread(`${w.id}fe`, 0, FERMENTS.length - 1)])],
    ["yeast", (w) => chrome(spread(`${w.id}ye`, 0, 1) ? "yeast.native" : "yeast.cultured")],
    ["newOak", (w) => measurement(spread(`${w.id}oa`, 0, 12) * 5, "unit.percent")],
    ["productionRun", (w) => measurement(spread(`${w.id}pr`, 12, 240) * 100, "unit.bottles")],
    ["drinkWindow", (w) => (w.vintage ? yearRange(w.vintage + 2, w.vintage + 2 + spread(`${w.id}dw`, 6, 18)) : null)],
  ];

  const verificationOf = (w, key) => ({
    confirmations: Math.min(w.noteCount ?? 0, spread(`${w.id}${key}v`, 0, 60)),
    disputed: spread(`${w.id}${key}d`, 0, 19) === 0,
  });

  const referenceGroup = (w) => ({
    key: "matched",
    // Derived, never spelled — the contract types `labelKey` as
    // `record.group.${key}`, so a hand-written label can silently stop
    // matching the group it belongs to.
    labelKey: recordGroupLabelKey("matched"),
    noteKey: recordGroupNoteKey("matched"),
    fields: REFERENCE_FIELDS.map(([key, source, read]) => {
      const value = read(w);
      return value === null
        ? null
        : { key, value, source, kind: "reference", verification: verificationOf(w, key) };
    }).filter(Boolean),
  });

  const privateGroup = (w, answered) => ({
    key: answered ? "estateAnswered" : "estatePrivate",
    labelKey: recordGroupLabelKey(answered ? "estateAnswered" : "estatePrivate"),
    ...(answered ? {} : { noteKey: recordGroupNoteKey("estatePrivate") }),
    fields: PRIVATE_FIELDS.map(([key, read]) => {
      if (!answered) return { key, kind: "estate_private" };
      const value = read(w);
      return value === null ? null : { key, value, source: "estate", kind: "estate_private" };
    }).filter(Boolean),
  });

  const commercialGroup = (w) => ({
    key: "distributorAnswered",
    labelKey: recordGroupLabelKey("distributorAnswered"),
    fields: [
      { key: "importer", value: canonical("Cape & Loire SARL"), source: "distributor", kind: "commercial" },
      { key: "format", value: measurement(750, "unit.millilitre"), source: "distributor", kind: "commercial" },
      { key: "stock", value: chrome(spread(`${w.id}st`, 0, 3) ? "stock.inWarehouse" : "stock.onAllocation"), source: "distributor", kind: "commercial" },
    ],
  });


  /**
   * The register, counted from the notes this wine actually has.
   *
   * It used to be synthesised from `w.noteCount` — a number that counted nothing
   * — so the aggregate could not be checked against anything and the
   * fault-exclusion rule had no rows to demonstrate itself on. The thresholds,
   * the fault filter and the whole derivation now live in `../register.mjs`,
   * which is also where a server would put them: one filter at the top, not a
   * condition remembered at seven call sites.
   */
  const registerOf = (w) => registerFromNotes(notesByWine.get(w.id) ?? []);

  const availabilityOf = (w, overlay) => {
    const kind = w.claimedBy.kind;
    const received = spread(`${w.id}rr`, 4, 40);
    return {
      claimantName: w.claimedBy.name,
      claimantTier: kind,
      ...(w.price ? { price: w.price } : {}),
      unit: {
        volume: measurement(750, "unit.millilitre"),
        channel: kind === "producer" ? "cellar_door" : "warehouse",
        ...(kind === "distributor" ? { minimumBottles: 6 } : {}),
      },
      ...(overlay?.isAllocation ? { isAllocation: true } : {}),
      acceptsRequests: true,
      responseRecord: {
        requestsReceived: received,
        requestsAnswered: received - spread(`${w.id}ra`, 0, 3),
        typicalResponseHours: kind === "producer" ? 48 : 24,
      },
    };
  };

  const verticalOf = (w, byLabel) =>
    (byLabel.get(w.wineLabelId) ?? [])
      .filter((s) => s.vintage)
      .sort((a, b) => b.vintage - a.vintage)
      .slice(0, 6)
      .map((s) => ({
        wineVintageId: s.id,
        vintage: s.vintage,
        ...(s.verdict ? { verdict: s.verdict } : {}),
        noteCount: s.noteCount ?? 0,
        ...(s.id === w.id ? { isCurrent: true } : {}),
      }));

  const byLabel = new Map();
  wines.forEach((w) => {
    if (!w.wineLabelId) return;
    if (!byLabel.has(w.wineLabelId)) byLabel.set(w.wineLabelId, []);
    byLabel.get(w.wineLabelId).push(w);
  });

  const OVERLAY = Object.fromEntries(curated("wine-records").map((r) => [r.wineVintageId, r]));

  const records = wines.map((w) => {
    const overlay = OVERLAY[w.id];
    const kind = w.claimedBy?.kind ?? null;
    const groups = [referenceGroup(w)];
    if (kind === "distributor") groups.push(commercialGroup(w));
    groups.push(privateGroup(w, kind === "producer"));

    const vertical = verticalOf(w, byLabel);
    return {
      wineVintageId: w.id,
      ...(w.claimedBy ? { claimedBy: w.claimedBy } : {}),
      groups,
      // A producer claim is what opens the estate's account. A distributor claim
      // is not: it can say where the bottle is, never what the vineyard is.
      locked:
        kind === "producer"
          ? []
          : [
              {
                key: "estateVoice",
                titleKey: "record.locked.estateVoice.title",
                bodyKey: kind === "distributor"
                  ? "record.locked.estateVoice.distributorBody"
                  : "record.locked.estateVoice.body",
                params: {
                  estate: w.estate,
                  ...(kind === "distributor" ? { distributor: w.claimedBy.name } : {}),
                },
                needs: "producer",
              },
            ],
      register: registerOf(w),
      // Authored, never derived: a member's own words and an estate's own writing
      // are the two things no generator has any business inventing.
      ...(overlay?.featuredNote ? { featuredNote: overlay.featuredNote } : {}),
      ...(kind === "producer" && overlay?.estateVoice ? { estateVoice: overlay.estateVoice } : {}),
      ...(w.claimedBy ? { availability: availabilityOf(w, overlay?.availability) } : {}),
      ...(vertical.length > 1 ? { vertical } : {}),
      ...(w.cellarCount === undefined ? {} : { cellarCount: w.cellarCount }),
    };
  });

  return records;
}
