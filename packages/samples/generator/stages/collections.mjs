import { curated } from "../curated.mjs";
import { slug } from "../data.mjs";
import { spread } from "../random.mjs";
import { lensRow } from "../lenses.mjs";

const CURATED = curated("collections");

/**
 * The published lists — shelves, itineraries and the house's selections.
 *
 * ## Why this became a generated stage
 *
 * `collections.json` was hand-maintained and therefore outside `--check`, the
 * same gap editorial and the notes had. Five rows also could not exercise the
 * thing the landings are FOR: an authorship lens over five lists is three chips
 * of one or two, and a fixture like that cannot tell a working filter from a
 * broken one.
 *
 * The five curated rows stay verbatim and first — `discover/curation.json` and
 * the Masthead's chapters 03 and 05 name their ids, and a member who followed a
 * link has to land on the thing they tapped.
 *
 * ## Every generated list has an author in one of the three buckets
 *
 * The authorship lens asks WHO, and its three answers beyond "all" are
 * sommeliers, members and Kgwari. Generating authors at random would leave the
 * buckets lopsided by luck; the rotation below guarantees every chip has enough
 * behind it to be worth tapping, which is the state the landing is designed
 * around rather than a happy accident.
 */

/** Shelf titles — a member's words, not a vocabulary. */
const SHELF_TITLES = [
  ["Bottles for a long lunch", "Nothing that needs thinking about."],
  ["The cellar's quiet corner", "Wines I keep forgetting I have, and shouldn't."],
  ["Chenin, the long way round", "Ten years of one grape, in the order I met it."],
  ["Under two hundred", "Proof that the good stuff is not always dear."],
  ["Bought on the farm", "Every one of these came home in the boot."],
  ["For the sceptics", "Pour these blind to anyone who says the Cape can't age."]
];

/**
 * Route titles. The STOPS are drawn from the producer seed rather than written
 * here, because a stop is a navigable proper noun: a route naming an estate the
 * catalogue does not carry is a detail line whose every word leads nowhere.
 */
const ITINERARY_TITLES = [
  "A morning in Franschhoek",
  "The Hemel-en-Aarde run",
  "Constantia, end to end",
  "Elgin, slowly"
];

/** How many stops a route's detail line shows before it stops listing. */
const STOPS_SHOWN = 3;

/**
 * The three authorship buckets, rotated rather than drawn.
 *
 * The house's byline is a NAME AND NO MARK, exactly as an in-house editorial
 * piece is attributed — which is also why the lens buckets have to be computed
 * on the server: `{ name: "Kgwari" }` and a member byline with no status are the
 * same shape, so nothing structural tells them apart.
 */
const AUTHORS = [
  { name: "Nomsa Dlamini", tier: "professional", role: "sommelier" },
  { name: "Lerato Mabaso", status: "collector" },
  { name: "Kgwari" },
  { name: "Marius Louw", tier: "professional", role: "sommelier" },
  { name: "Sipho Ndlovu", status: "enthusiast" }
];

/** Which lens a byline falls under. The server's decision, modelled here. */
export function authorshipLens(author) {
  if (author.tier === "professional") return "lens.sommeliers";
  if (author.status !== undefined) return "lens.members";
  return "lens.kgwari";
}

export function buildCollections({ wines, producers }) {
  const curatedIds = new Set(CURATED.map((c) => c.id));

  const shelves = SHELF_TITLES.map(([title, description], i) => {
    const author = AUTHORS[i % AUTHORS.length];
    const id = `collection_${slug(title)}`;
    const picks = wines.slice(i * 4, i * 4 + 3);
    return {
      id,
      // Kgwari's own list is a Selection; everyone else's is a Shelf. The kind
      // is a function of the author, never a badge added on top.
      kind: author.name === "Kgwari" ? "selection" : "shelf",
      subject: "wines",
      title,
      description,
      author,
      // Strictly more than the strip shows, for the same reason.
      itemCount: picks.length + 1 + spread(`${id}n`, 0, 12),
      saveCount: spread(`${id}s`, 0, 240),
      preview: picks.map((wine) => ({
        contentId: wine.id,
        title: `${wine.name}${wine.vintage ? ` ${wine.vintage}` : ""}`
      })),
      createdAt: `2026-0${5 + (i % 3)}-${String(4 + i * 3).padStart(2, "0")}T09:30:00.000Z`
    };
  }).filter((c) => !curatedIds.has(c.id));

  const itineraries = ITINERARY_TITLES.map((title, i) => {
    const author = AUTHORS[(i + 1) % AUTHORS.length];
    const id = `collection_${slug(title)}`;
    // Five real estates, three of them named on the row. The strip is a handful
    // of the list and never a census of it — a fixture where the two match
    // teaches a consumer that `preview.length` is the count, and it is not.
    const stops = producers.slice(i * 5, i * 5 + 5);
    return {
      id,
      kind: author.name === "Kgwari" ? "selection" : "itinerary",
      subject: "estates",
      title,
      author,
      // The stops ARE the detail line, in the author's order — a route has a
      // direction, and re-sorting somebody's list deletes the part they made.
      itemCount: stops.length,
      saveCount: spread(`${id}s`, 0, 120),
      preview: stops.slice(0, STOPS_SHOWN).map((stop) => ({
        contentId: stop.id,
        title: stop.name
      })),
      createdAt: `2026-0${6 + (i % 2)}-${String(2 + i * 5).padStart(2, "0")}T14:00:00.000Z`
    };
  }).filter((c) => !curatedIds.has(c.id));

  const all = [...CURATED, ...shelves, ...itineraries];

  /**
   * A landing: the rows for one subject, newest first, with its chip row.
   *
   * Date order INCLUDING the house's. Kgwari is a lens and not a band, so a
   * Selection sorts among the members' and the sommeliers' lists and the byline
   * does the only distinguishing there is — sorting the house to the top would
   * invent the curated badge the taxonomy refused.
   */
  const landing = (subject) => {
    const rows = all
      .filter((c) => c.subject === subject)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return {
      items: rows,
      lenses: lensRow(rows.map((row) => authorshipLens(row.author)), [
        "lens.all",
        "lens.sommeliers",
        "lens.members",
        "lens.kgwari"
      ])
    };
  };

  return { all, shelves: landing("wines"), itineraries: landing("estates") };
}
