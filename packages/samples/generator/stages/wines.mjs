import { canonical } from "../text.mjs";
import { CURRENCY_BY_COUNTRY } from "@edwardseshoka/contracts/money";
import { GRAPES } from "@edwardseshoka/contracts/catalog";
import { originSystemFor } from "@edwardseshoka/contracts/provenance";
import { VERDICTS } from "@edwardseshoka/contracts/trust";

import { curated } from "../curated.mjs";
import { IMAGES } from "../images.mjs";
import { int, pick, rnd, spread } from "../random.mjs";
import { GRAPE_NAMES, slug } from "../data.mjs";

const CURATED_WINES = curated("wines");

/**
 * The catalogue. The largest stage, and the one every later stage depends on.
 *
 * Curated wines come FIRST and verbatim — their ids are referenced from outside
 * the generator, and regenerating them once broke the discover hero silently.
 */
export function buildWines({ regions, producers, regionByName }) {
  /**
   * Wine names BY COUNTRY. Assigning them round-robin produced "Barolo
   * Castiglione" from a Stellenbosch estate priced in rand — nonsense that would
   * mislead anyone reading the seed, and it defeats the reason for using real
   * names at all.
   */
  const WINE_NAMES_BY_COUNTRY = {
    ZA: ["Rubicon", "Paul Sauer", "Estate Reserve", "The Mint", "Directors Reserve",
         "Book XVII", "Palladius", "Columella", "Old Vine Chenin", "Cape Blend",
         "Vin de Constance", "Grand Constance", "Pinotage Reserve", "Chenin Blanc",
         "Sauvignon Blanc Reserve", "Cabernet Sauvignon", "Syrah", "Shiraz"],
    FR: ["Grand Cru", "Premier Cru", "Clos des Vignes", "Côte-Rôtie La Mouline",
         "Châteauneuf Hommage", "Latitude Extra Brut", "Blanc de Blancs",
         "Sancerre Les Romains", "Cuvée Réserve", "Vieilles Vignes", "Brut Nature"],
    IT: ["Barolo Castiglione", "Brunello", "Chianti Classico Riserva", "Etna Rosso",
         "Amarone della Valpolicella", "Barbaresco", "Ribolla Gialla", "Nebbiolo Langhe"],
    ES: ["Gran Reserva", "Único", "Albariño", "Fino en Rama", "Clos Mogador",
         "Reserva Especial", "Tinto Crianza", "Mencía Selección"],
    DE: ["Riesling Kabinett", "Grosses Gewächs", "Spätlese Trocken", "Trockenbeerenauslese",
         "Spätburgunder Reserve", "Weissburgunder"],
    AT: ["Grüner Smaragd", "Riesling Federspiel", "Grüner Veltliner Ried"],
    CH: ["Fendant du Valais", "Cornalin Réserve", "Chasselas Grand Cru"],
    US: ["Monte Bello", "Estate Pinot", "Napa Cabernet Reserve", "Russian River Chardonnay"],
    CA: ["Icewine Riesling", "Estate Pinot Noir", "Okanagan Merlot"],
    GB: ["Classic Cuvée", "Blanc de Blancs Brut", "Rosé Brut", "Sparkling Reserve"],
  };

  /**
   * A wine is claimed or it is not, and the claimant's kind is what a claim buys.
   * The roll keeps the same three slots the old `["verified","listed","community"]`
   * roll had, in the same order, so migrating the model did not reshuffle which
   * wine got which outcome.
   */
  const CLAIM_ROLL = ["producer", "distributor", null];


  const claimedAt = (id, kind) =>
    `${kind === "producer" ? 2025 : 2026}-${String(spread(id + kind, 1, 12)).padStart(2, "0")}-${String(spread(`${id}${kind}d`, 1, 28)).padStart(2, "0")}T00:00:00.000Z`;

  /**
   * `provenance` is a projection of the claim, never an independent field — which
   * is why both come out of one function and cannot disagree.
   */
  const claimOf = (kind, w) =>
    kind === null
      ? { provenance: "community" }
      : {
          provenance: "claimed",
          claimedBy: {
            kind,
            // A distributor claim is a listing, so it carries the trade's name and
            // not the estate's — the estate has said nothing.
            name: canonical(kind === "producer" ? w.estate : "Great Domaines"),
            ...(kind === "producer" && w.producerId ? { producerId: w.producerId } : {}),
            claimedAt: claimedAt(w.id, kind),
          },
        };

  /** Held more often than written about, saved more often than held. */
  const counts = (w) => ({
    cellarCount: Math.round((w.noteCount ?? 0) * (1.4 + spread(`${w.id}c`, 0, 40) / 100)),
    saveCount: Math.round((w.noteCount ?? 0) * (3 + spread(`${w.id}s`, 0, 90) / 100)),
  });

  const wines = [...CURATED_WINES];
  const curatedProducerIds = new Set(CURATED_WINES.map((w) => w.producerId));
  producers.forEach((p, pi) => {
    // A producer that already has a curated wine keeps only that one, so the
    // recognisable seed stays recognisable.
    if (curatedProducerIds.has(p.id)) return;
    const region = regions.find((r) => r.id === p.regionId);
    const currency = CURRENCY_BY_COUNTRY[region.countryCode] ?? "EUR";
    const count = pi < 20 ? 1 : rnd() > 0.6 ? 2 : 1;
    for (let n = 0; n < count; n++) {
      const names = WINE_NAMES_BY_COUNTRY[region.countryCode] ?? WINE_NAMES_BY_COUNTRY.FR;
      const base = names[(pi + n) % names.length];
      const nonVintage = rnd() > 0.92;
      const vintage = nonVintage ? null : int(2010, 2022);
      const grapeKey = pick(GRAPES);
      const grape = GRAPE_NAMES[grapeKey];
      const id = nonVintage ? `${slug(p.name)}-${slug(base)}-nv` : `${slug(base)}-${vintage}-${slug(p.name).slice(0, 12)}`;
      // Price scaled to region prestige, kept in the country's own currency —
      // the currency follows the DATA, never the member's locale.
      const majorUnits = int(12, 480) * (region.countryCode === "ZA" ? 4 : 1);
      wines.push({
        id,
        wineLabelId: slug(base),
        name: base,
        estate: p.name,
        producerId: p.id,
        ...(vintage ? { vintage, year: vintage } : {}),
        countryCode: region.countryCode,
        region: region.name,
        regionId: region.id,
        appellation: { id: `app_${slug(region.name)}`, name: region.name, system: originSystemFor(region.countryCode) },
        styleName: grape,
        color: /Blanc|Chardonnay|Riesling|Albariño|Grüner|Gewürz|Pinot Gris|Pinot Grigio|Sémillon|Palomino/.test(grape) ? "white" : "red",
        grapeBlend: [{ grapeVarietyId: grapeKey, grapeName: GRAPE_NAMES[grapeKey], percentage: 100 }],
        location: { area: region.name },
        imageUrl: IMAGES[wines.length % IMAGES.length],
        description: `${base} from ${p.name}, ${region.name}.`,
        price: { amountMinorUnits: majorUnits * 100, currency },
        isFeatured: wines.length === 0,
        verdict: pick(VERDICTS),
        // One rnd() draw, exactly as the old three-state roll took — so the same
        // wines land on the same outcome and the rest of the file does not churn.
        ...claimOf(pick(CLAIM_ROLL), { id, estate: p.name, producerId: p.id }),
        noteCount: int(3, 900),
      });
    }
  });

  // Cellar and save counts are a pure function of the note count, so they are
  // derived for curated and generated wines alike rather than hand-written into
  // `orig-wines.json` — a derived field in a curated file is a field that goes
  // stale the first time the count it derives from moves.
  wines.forEach((w) => Object.assign(w, counts(w)));

  return wines;
}
