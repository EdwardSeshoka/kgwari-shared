import { readFileSync } from "node:fs";

/**
 * The seed CONTENT — regions, estates, people, tasting titles, grape words.
 *
 * Data, and now stored as data. It was 300 lines of JavaScript, which meant the
 * `--check` drift guard could not cover it and it sat in a different format from
 * `orig-*.json`, its siblings in the same directory doing the same job.
 *
 * What is NOT here any more: the vocabularies and mappings this file used to
 * carry — verdicts, currency by country, origin systems, grape keys. Those are
 * models the running app depends on and live in `@edwardseshoka/contracts`. The
 * line between them: **a fact the app relies on is a model; material for
 * inventing plausible rows is content.** "France uses AOC" is the first;
 * "Château Margaux is a believable French name" is the second.
 */
const content = JSON.parse(readFileSync(new URL("./content.json", import.meta.url), "utf8"));

export const REGIONS = content.regions;
export const PRODUCERS = content.producers;
export const PEOPLE = content.people;
export const TASTING_TITLES = content.tastingTitles;

/**
 * Display words for the grape KEYS `@edwardseshoka/contracts/catalog` declares.
 * The keys are the model; these words exist so a generated wine reads
 * believably, which is scaffolding.
 */
export const GRAPE_NAMES = content.grapeNames;

/** URL-safe id fragment. */
export const slug = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
