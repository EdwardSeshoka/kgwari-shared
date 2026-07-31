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
import { buildCorpus } from "./stages/corpus.mjs";
import { buildPeople } from "./stages/people.mjs";
import { buildProducers } from "./stages/producers.mjs";
import { buildRecords } from "./stages/records.mjs";
import { buildRegions } from "./stages/regions.mjs";
import { buildTastings } from "./stages/tastings.mjs";
import { buildWines } from "./stages/wines.mjs";
import { emitter } from "./emit.mjs";

const { regions, regionByName } = buildRegions();
const producers = buildProducers({ regionByName });
const wines = buildWines({ regions, producers, regionByName });
const events = buildTastings({ producers, regions });
const users = buildPeople();
const activities = buildActivities({ users, wines });
const corpus = buildCorpus({ wines, producers, regions, events, users });
const browse = buildBrowse({ regions, wines, corpus });
const records = buildRecords({ wines, regions, producers });

const { write, report } = emitter({ check: process.argv.includes("--check") });

write("provenance/regions.json", regions);
write("provenance/producers.json", producers);
write("catalog/wines.json", wines);
write("catalog/wine-records.json", records);
write("events/events.json", events);
write("social/activities.json", activities);
write("search/search-corpus.json", corpus);
write("search/browse-groups.json", browse);

const byKind = (k) => corpus.filter((c) => c.kind === k).length;
console.log("regions   ", regions.length);
console.log("producers ", producers.length);
console.log("wines     ", wines.length);
console.log("records   ", records.length);
console.log("tastings  ", events.length);
console.log("people    ", users.length);
console.log("---");
console.log("corpus", corpus.length, "=", ["WINE", "ESTATE", "REGION", "TASTING", "PERSON"].map((k) => `${k}:${byKind(k)}`).join(" "));
console.log("currencies", [...new Set(wines.map((w) => w.price.currency))].sort().join(", "));
console.log("languages ", [...new Set(corpus.flatMap((c) => [c.title, c.eyebrow].filter((t) => t?.source === "negotiated").map((t) => t.languageTag)))].sort().join(", "));

report();
