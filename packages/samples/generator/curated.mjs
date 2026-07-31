import { readFileSync } from "node:fs";

const HERE = new URL(".", import.meta.url).pathname;

/**
 * The original hand-curated seeds, kept VERBATIM and first.
 *
 * Their ids are referenced from OUTSIDE the generator — `discover/curation.json`
 * features `rubicon-2018` as its hero, and app doubles name others. Regenerating
 * those ids broke the discover hero silently: the reference stayed and the record
 * went. Generated rows are appended around these, never in place of them.
 */
export const curated = (name) => JSON.parse(readFileSync(`${HERE}orig-${name}.json`, "utf8"));
