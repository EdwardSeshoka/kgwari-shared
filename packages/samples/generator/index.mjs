/**
 * Generates every seed from one curated source, so the cross-references that
 * make the search corpus meaningful hold by construction rather than by care.
 *
 * The invariant this protects: **every `entityId` on a search row resolves to a
 * record in the owning domain's seed.** Hand-maintaining that across eight files
 * is what let `user_thandi_nkosi` dangle — a search result opening onto nothing.
 *
 * ## The order below is load-bearing
 *
 * Two reasons, and both are silent when broken. Later stages take earlier ones
 * as INPUT — producers need regions, the corpus needs five prior stages. And
 * every stage draws from one shared pseudo-random stream (`random.mjs`), so
 * reordering two of them changes every generated value downstream: not a crash,
 * a different catalogue whose ids nothing outside still points at.
 */
import { buildActivities } from "./stages/activities.mjs";
import { buildBrowse } from "./stages/browse.mjs";
import { buildCellar } from "./stages/cellar.mjs";
import { buildCollections } from "./stages/collections.mjs";
import { buildCorpus } from "./stages/corpus.mjs";
import { applyNoteCounts } from "./register.mjs";
import { buildEditorial } from "./stages/editorial.mjs";
import { buildLandings } from "./stages/landings.mjs";
import { buildMasthead } from "./stages/masthead.mjs";
import { buildNotes } from "./stages/notes.mjs";
import { buildPeople } from "./stages/people.mjs";
import { buildProducers } from "./stages/producers.mjs";
import { buildRecords } from "./stages/records.mjs";
import { buildRegions } from "./stages/regions.mjs";
import { buildRoutes, nameRouteOrigins } from "./stages/routes.mjs";
import { buildTastings } from "./stages/tastings.mjs";
import { buildWines } from "./stages/wines.mjs";
import { emitter } from "./emit.mjs";

const { regions, regionByName } = buildRegions();
const producers = buildProducers({ regionByName });
const wines = buildWines({ regions, producers, regionByName });
const events = buildTastings({ producers, regions });
const users = buildPeople();
const activities = buildActivities({ users, wines });
/**
 * Notes run AFTER activities and draw only from `spread`, never from `rnd` — so
 * adding them changes nothing generated before or after them. That is deliberate:
 * a stage that consumed the shared stream here would have re-rolled the entire
 * corpus downstream, and every id referenced from outside the generator with it.
 */
const notes = buildNotes({ wines, users });
/**
 * The routes' stops, and the notes written on them.
 *
 * Runs BEFORE `applyNoteCounts` on purpose: a note written on the tram is a real
 * opinion about a vintage, so it must count toward that wine's `noteCount` and feed
 * its register exactly as a standalone note does. Suppressing the LEDGER row is not
 * suppressing the note — see `TastingNoteContract.origin`.
 *
 * Like `buildNotes`, it draws only from `spread`, so inserting it here re-rolls
 * nothing downstream.
 */
const routes = buildRoutes({ producers, wines, events });
const allNotes = [...notes, ...routes.notes];
/**
 * The corpus is written BACK onto the catalogue before anything reads it again.
 *
 * `wine.noteCount` is now a count of the note file and `wine.verdict` is the one
 * its own notes voted for — so the search corpus, the browse groups and the
 * records all see the same numbers a reader would arrive at by counting. It
 * mutates in place because those three stages already hold this array.
 */
applyNoteCounts({ wines, notes: allNotes });
/**
 * The published lists, and the two landings they feed.
 *
 * Reads `wines` and `producers` so a preview strip points at seeds that exist —
 * a cover of labels for a shelf, the stops in order for a route.
 */
const collections = buildCollections({ wines, routes });
/**
 * The route titles live on the cards, which are built after the notes — so each
 * note's `origin.itineraryTitle` is written with the id and corrected here, in one
 * place, rather than duplicating the title table into the routes stage.
 */
nameRouteOrigins({ notes: routes.notes, collections: collections.all });
/** Reads `events` so an event piece can embed the one event, rather than restate it. */
const editorial = buildEditorial({ events });
/** The two landings that need no corpus of their own. */
const landings = buildLandings({ events, editorial });
/** The settled Masthead v2 page — resolved against everything above it. */
const masthead = buildMasthead({ wines, notes: allNotes, editorial, events, users, collections });
/**
 * One member's holdings and her cellar home.
 *
 * Runs AFTER `collections` because the index's Following and Routes runs are rows
 * from that pool — a cellar that built its own would show a member routes nothing
 * else in the seed knows about, and the projection over them could never be checked
 * against the route detail it is derived from.
 *
 * Draws only from `spread`, so it re-rolls nothing downstream.
 */
const cellar = buildCellar({ wines, collections, routes });
const corpus = buildCorpus({ wines, producers, regions, events, users });
const browse = buildBrowse({ regions, wines, corpus });
const records = buildRecords({ wines, regions, producers, notes: allNotes });

const { write, report } = emitter({ check: process.argv.includes("--check") });

write("provenance/regions.json", regions);
write("provenance/producers.json", producers);
write("catalog/wines.json", wines);
write("catalog/wine-records.json", records);
write("events/events.json", events);
write("social/activities.json", activities);
write("social/tasting-notes.json", allNotes);
write("editorial/editorial.json", editorial.cards);
write("editorial/editorial-details.json", editorial.details);
write("collections/collections.json", collections.all);
write("collections/shelves-landing.json", collections.shelves);
write("collections/itineraries-landing.json", collections.itineraries);
write("collections/collection-details.json", collections.details);
write("cellar/cellar.json", cellar.holdings);
write("cellar/cellar-index.json", cellar.index);
write("events/calendar-landing.json", landings.calendar);
write("editorial/archive-landing.json", landings.archive);
write("discover/discover-response.json", masthead);
write("search/search-corpus.json", corpus);
write("search/browse-groups.json", browse);

const byKind = (k) => corpus.filter((c) => c.kind === k).length;
console.log("regions   ", regions.length);
console.log("producers ", producers.length);
console.log("wines     ", wines.length);
console.log("records   ", records.length);
console.log("tastings  ", events.length);
console.log("people    ", users.length);
console.log("routes    ", routes.byCollection.size, "with", routes.notes.length, "notes on them");
console.log(
  "cellar    ",
  cellar.index.summary.bottles, "bottles /",
  cellar.index.summary.wines, "wines /",
  cellar.index.summary.estates, "estates,",
  cellar.holdings.metOnRoutes?.wineCount ?? 0, "met on routes"
);
console.log("---");
console.log("corpus", corpus.length, "=", ["WINE", "ESTATE", "REGION", "TASTING", "PERSON"].map((k) => `${k}:${byKind(k)}`).join(" "));
console.log("currencies", [...new Set(wines.map((w) => w.price.currency))].sort().join(", "));
console.log("languages ", [...new Set(corpus.flatMap((c) => [c.title, c.eyebrow].filter((t) => t?.source === "negotiated").map((t) => t.languageTag)))].sort().join(", "));

report();
