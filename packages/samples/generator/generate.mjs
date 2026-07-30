/**
 * Generates every seed from one curated source, so the cross-references that
 * make the search corpus meaningful hold by construction rather than by care.
 *
 * The invariant this protects: every `entityId` on a search row resolves to a
 * record in the owning domain's seed. Hand-maintaining that across five files
 * is what let `user_thandi_nkosi` dangle.
 */
import { readFileSync, writeFileSync } from "node:fs";
import {
  CURRENCY_BY_COUNTRY,
  GRAPES,
  PEOPLE,
  PRODUCERS,
  REGIONS,
  TASTING_TITLES,
  VERDICTS,
  slug,
} from "./data.mjs";

const OUT = new URL("../src/features/", import.meta.url).pathname;
const HERE = new URL(".", import.meta.url).pathname;

/**
 * The original hand-curated seeds, kept VERBATIM and first.
 *
 * Their ids are referenced from outside this file — `discover/curation.json`
 * features `rubicon-2018` as its hero, and app doubles and fixtures name others.
 * Regenerating those ids broke the discover hero silently: the reference stayed,
 * the record went. Generated rows are appended around these, never in place of
 * them.
 */
const curated = (name) => JSON.parse(readFileSync(`${HERE}orig-${name}.json`, "utf8"));
const CURATED_WINES = curated("wines");
const CURATED_EVENTS = curated("events");
const CURATED_ACTIVITIES = curated("activities");

/** Deterministic pseudo-random so regenerating produces identical files. */
let seed = 20260730;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const int = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

const IMAGES = [
  "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1543418219-44e30b057fea?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80",
];

/* ---------------------------------------------------------------- regions */
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

/* -------------------------------------------------------------- producers */
const producers = PRODUCERS.map(([name, regionName, founded, wineCount], i) => {
  const region = regionByName.get(regionName);
  if (!region) throw new Error(`producer ${name}: unknown region ${regionName}`);
  return {
    id: `estate_${slug(name)}`,
    name,
    countryCode: region.countryCode,
    regionId: region.id,
    regionName: region.name,
    foundedYear: founded,
    imageUrl: IMAGES[i % IMAGES.length],
    description: `${name}, ${region.name}.`,
    wineCount,
  };
});

/* ------------------------------------------------------------------ wines */
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
 * The origin system by country. `WineOriginSystemContract` is a CLOSED union, and
 * an earlier version emitted "PDO" — which is a real EU term and not a member of
 * that union, so every German, Swiss, British and Canadian wine failed the record
 * mapper. Caught by the discover contract test, not by any seed checker.
 */
const originSystem = (cc) =>
  ({
    ZA: "WO",
    FR: "AOC",
    IT: "DOCG",
    ES: "DO",
    DE: "AOP", // EU-wide protected designation
    AT: "AOP",
    US: "AVA",
  })[cc] ?? "Other"; // CH, GB, CA sit outside the systems this union names

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
    const grape = pick(GRAPES);
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
      appellation: { id: `app_${slug(region.name)}`, name: region.name, system: originSystem(region.countryCode) },
      styleName: grape,
      color: /Blanc|Chardonnay|Riesling|Albariño|Grüner|Gewürz|Pinot Gris|Pinot Grigio|Sémillon|Palomino/.test(grape) ? "white" : "red",
      grapeBlend: [{ grapeVarietyId: `grape_${slug(grape)}`, grapeName: grape, percentage: 100 }],
      location: { area: region.name },
      imageUrl: IMAGES[wines.length % IMAGES.length],
      description: `${base} from ${p.name}, ${region.name}.`,
      price: { amountMinorUnits: majorUnits * 100, currency },
      isFeatured: wines.length === 0,
      verdict: pick(VERDICTS),
      provenance: pick(["verified", "listed", "community"]),
      noteCount: int(3, 900),
    });
  }
});

/* --------------------------------------------------------------- tastings */
const curatedEventIds = new Set(CURATED_EVENTS.map((e) => e.id));
const events = [...CURATED_EVENTS, ...TASTING_TITLES.map(([title, lang], i) => {
  const p = producers[(i * 7) % producers.length];
  const region = regions.find((r) => r.id === p.regionId);
  const day = 20 + (i % 9);
  const capped = rnd() > 0.25;
  return {
    id: `event_${slug(title)}`,
    title,
    titleLanguage: lang,
    eventType: pick(["winemaker_dinner", "sommelier_led", "pairing", "masterclass"]),
    startDateTime: `2026-0${day > 30 ? 9 : 8}-${String((day % 28) + 1).padStart(2, "0")}T${String(int(15, 19)).padStart(2, "0")}:00:00.000Z`,
    venueName: p.name,
    location: region.name,
    ...(capped ? { seatsAvailable: int(2, 40) } : {}),
    imageUrl: IMAGES[i % IMAGES.length],
    host: { name: PEOPLE[i % PEOPLE.length][0], tier: "professional", role: "sommelier" },
    subject: { kind: "region", regionId: region.id },
  };
}).filter((e) => !curatedEventIds.has(e.id))];

/* ----------------------------------------------------------------- people */
const users = PEOPLE.map(([displayName, status, role]) => ({
  id: `user_${slug(displayName)}`,
  displayName,
  initials: displayName.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
  ...(status ? { status } : {}),
  ...(role ? { tier: "professional", role } : {}),
  noteCount: int(1, 320),
}));

/* --------------------------------------------------- activities (social) */
// EVERY user gets an activity. Generating people into the corpus without a
// record in the owning domain is precisely how `user_thandi_nkosi` came to point
// at nothing — at 52 people that stops being one oversight and becomes 28.
const curatedUserIds = new Set(CURATED_ACTIVITIES.map((a) => a.user.id));
const activities = [...CURATED_ACTIVITIES, ...users.filter((u) => !curatedUserIds.has(u.id)).map((u, i) => {
  const w = wines[(i * 3) % wines.length];
  return {
    id: `activity_${slug(u.displayName)}_${i}`,
    activityType: "review",
    user: { id: u.id, displayName: u.displayName, initials: u.initials, ...(u.status ? { status: u.status } : {}), ...(u.role ? { tier: "professional", role: u.role } : {}) },
    wine: { id: w.id, wineLabelId: w.wineLabelId, name: w.name, producerName: w.estate, ...(w.vintage ? { vintage: w.vintage, vintageDisplay: String(w.vintage) } : {}) },
    verdict: w.verdict,
    note: `Tasted at ${w.region}.`,
    createdAt: "2026-07-20T18:30:00.000Z",
  };
})];

/* --------------------------------------------- the search corpus, derived */
const canonical = (text) => ({ source: "canonical", text });
const negotiated = (text, languageTag) => ({ source: "negotiated", text, languageTag });
const chrome = (key) => ({ source: "chrome", key });

const corpus = [
  ...wines.map((w) => ({
    id: `search_wine_${w.id}`,
    kind: "WINE",
    facet: "wines",
    entityId: w.id,
    title: canonical(w.name),
    eyebrow: canonical(w.estate),
    meta: w.vintage ? { kind: "vintage", year: w.vintage } : { kind: "nonVintage" },
    verdict: w.verdict,
    listedPrice: w.price,
    imageUrl: w.imageUrl,
  })),
  ...producers.map((p) => ({
    id: `search_estate_${p.id}`,
    kind: "ESTATE",
    facet: "estates",
    entityId: p.id,
    title: canonical(p.name),
    eyebrow: canonical(p.regionName),
    meta: { kind: "estate", foundedYear: p.foundedYear, wineCount: p.wineCount },
  })),
  ...regions.map((r) => ({
    id: `search_region_${r.id}`,
    kind: "REGION",
    facet: "regions",
    entityId: r.id,
    // An exonymous place is NEGOTIATED — the server picked a name and says which
    // language it served. A place with one name everywhere stays canonical.
    title: r.exonym ? negotiated(r.name, r.nameLanguage) : canonical(r.name),
    eyebrow: canonical(r.parentRegion ?? r.country),
    meta: { kind: "region", wineCount: r.wineCount },
  })),
  ...events.map((e) => ({
    id: `search_tasting_${e.id}`,
    kind: "TASTING",
    facet: "tastings",
    entityId: e.id,
    // Curated prose: tier-2 content, so it carries the language it was served in.
    title: negotiated(e.title, e.titleLanguage ?? "en"),
    eyebrow: canonical(e.venueName),
    meta: {
      kind: "tasting",
      startsAt: e.startDateTime,
      ...(e.seatsAvailable !== undefined ? { seatsRemaining: e.seatsAvailable } : {}),
    },
  })),
  ...users.map((u) => ({
    id: `search_person_${u.id}`,
    kind: "PERSON",
    facet: "people",
    entityId: u.id,
    title: canonical(u.displayName),
    // A role is a closed enum, so it travels as a key the client renders.
    eyebrow: chrome(u.role ?? u.status),
    meta: { kind: "noteCount", count: u.noteCount },
  })),
];

/* ------------------------------------------------------------ browse groups */
const topRegions = [...regions].sort((a, b) => b.wineCount - a.wineCount).slice(0, 8);
const browse = [
  {
    id: "region",
    labelKey: "home.byRegion",
    items: topRegions.map((r) => ({
      id: slug(r.name),
      label: r.exonym ? negotiated(r.name, r.nameLanguage) : canonical(r.name),
      count: r.wineCount,
      query: r.name,
    })),
  },
  {
    id: "verdict",
    labelKey: "home.byVerdict",
    items: VERDICTS.map((v) => ({
      id: slug(v),
      label: chrome(v),
      count: corpus.filter((c) => c.verdict === v).length,
      query: v,
    })),
  },
  {
    id: "country",
    labelKey: "home.byCountry",
    items: [...new Set(regions.map((r) => r.country))].slice(0, 8).map((c) => ({
      id: slug(c),
      label: canonical(c),
      count: wines.filter((w) => regions.find((r) => r.id === w.regionId)?.country === c).length,
      query: c,
    })),
  },
];

const write = (path, data) =>
  writeFileSync(`${OUT}${path}`, JSON.stringify(data, null, 2) + "\n");

write("provenance/regions.json", regions);
write("provenance/producers.json", producers);
write("catalog/wines.json", wines);
write("events/events.json", events);
write("social/activities.json", activities);
write("search/search-corpus.json", corpus);
write("search/browse-groups.json", browse);

const byKind = (k) => corpus.filter((c) => c.kind === k).length;
console.log("regions   ", regions.length);
console.log("producers ", producers.length);
console.log("wines     ", wines.length);
console.log("tastings  ", events.length);
console.log("people    ", users.length);
console.log("---");
console.log("corpus", corpus.length, "=", ["WINE", "ESTATE", "REGION", "TASTING", "PERSON"].map((k) => `${k}:${byKind(k)}`).join(" "));
console.log("currencies", [...new Set(wines.map((w) => w.price.currency))].sort().join(", "));
console.log("languages ", [...new Set(corpus.flatMap((c) => [c.title, c.eyebrow].filter((t) => t?.source === "negotiated").map((t) => t.languageTag)))].sort().join(", "));
