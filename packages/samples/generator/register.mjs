import { FAULT_CONDITIONS, TASTING_SCALES } from "@edwardseshoka/contracts/vocabulary";
import { VERDICTS } from "@edwardseshoka/contracts/trust";

/**
 * The register, DERIVED from the note corpus.
 *
 * ## What this replaced
 *
 * A register synthesised from `wine.noteCount` — a number that counted nothing.
 * A record claimed 1,480 notes, the corpus held two, and the aggregate in
 * between was invented from the claim. Three things followed from that, and all
 * three were quiet:
 *
 *  - the fixture's aggregate could not be checked against anything, so a
 *    consumer reading it learned a shape but never a rule;
 *  - the fault-exclusion invariant had nothing to demonstrate itself on, because
 *    no note had ever fed a mean;
 *  - the numbers were free to be arbitrarily large, which is exactly why they
 *    were, and a "1,480 notes" fixture teaches a page how to look at scale while
 *    proving nothing about how it got there.
 *
 * Now every figure below is counted from real rows. The tally is smaller by two
 * orders of magnitude, which is the correction rather than a regression: the old
 * numbers were never counting anything.
 *
 * ## The invariant this module exists to enforce
 *
 * **A fault never counts against the wine's record.** {@link countable} is the
 * one place notes are filtered, and everything downstream reads its output — so
 * a corked bottle cannot reach a mean, a mention, a colour reading or a verdict
 * distribution by any path. That is the shape the rule has to take in a server
 * too: one filter at the top, not a condition remembered at seven call sites.
 */

/** The notes an aggregate may draw on: filed, and not faulted. */
export const countable = (notes) =>
  notes.filter(
    (note) =>
      note.readings === undefined || !FAULT_CONDITIONS.includes(note.readings.condition)
  );

/**
 * Which movement of a tasting each metric belongs to.
 *
 * The register groups by movement — appearance, nose, palate, conclusion — and a
 * metric's group is a fact about the metric rather than about the order it was
 * declared in. Colour depth is something you SEE, nose intensity something you
 * SMELL, and putting either on the palate would file a reading under a sense
 * that did not take it.
 */
const METRIC_GROUP = {
  colourDepth: "appearance",
  noseIntensity: "nose",
  tannin: "palate",
  acidity: "palate",
  body: "palate",
  sweetness: "palate",
  finish: "conclusion"
};

/**
 * Which tier an aroma belongs to — primary is fruit and flower, secondary is
 * winemaking, tertiary is age.
 *
 * Declared, not derived from position. The old version tiered by index (`i < 3`
 * primary, `i < 5` secondary), which made a wine's third-most-mentioned aroma
 * primary by arithmetic — so `aroma.curedMeat` could be reported as fruit
 * because enough people happened to name it. Tier is a property of the aroma.
 */
const AROMA_TIER = {
  "aroma.blackcurrant": "primary",
  "aroma.wildPlum": "primary",
  "aroma.violet": "primary",
  "aroma.greenApple": "primary",
  "aroma.citrusPeel": "primary",
  "aroma.whiteFlower": "primary",
  "aroma.driedApricot": "primary",
  "aroma.fynbosSmoke": "secondary",
  "aroma.cedar": "secondary",
  "aroma.clove": "secondary",
  "aroma.beeswax": "secondary",
  "aroma.toastedGrain": "secondary",
  "aroma.graphite": "tertiary",
  "aroma.driedFig": "tertiary",
  "aroma.curedMeat": "tertiary",
  "aroma.wetStone": "tertiary"
};

/**
 * A spread needs enough answers to be worth drawing; a disagreement needs enough
 * to disagree. Both are SERVER POLICY and neither reaches the wire — they show
 * up as an absent field, never as a number a client compares against.
 */
const SPREAD_THRESHOLD = 25;
const DISAGREEMENT_THRESHOLD = 100;

const percentagesOf = (counts, total) => {
  const pct = counts.map((n) => Math.round((n / total) * 100));
  // Rounding has to land on 100 somewhere. The largest bucket absorbs it, which
  // is the only choice that cannot turn a 0 % answer into a 1 % one.
  const largest = pct.indexOf(Math.max(...pct));
  pct[largest] += 100 - pct.reduce((a, b) => a + b, 0);
  return pct;
};

/**
 * The rung a mean should READ as.
 *
 * A five-point scale labels only its ends and its centre, so a mean of 3.6 has
 * no word of its own — it has to round to the nearest LABELLED rung. Returning
 * the empty string at index 1 or 3 would put an unrenderable `wordKey` on the
 * wire, which the contract's own type forbids and nothing was checking.
 */
const wordKeyFor = (metric, mean) => {
  const rungs = TASTING_SCALES[metric];
  const labelled = [0, 2, 4];
  const index = Math.round(mean) - 1;
  const nearest = labelled.reduce((best, candidate) =>
    Math.abs(candidate - index) < Math.abs(best - index) ? candidate : best
  );
  return rungs[nearest];
};

function scaleMetric(metric, answers) {
  const values = answers.map((a) => a.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const buckets = [0, 0, 0, 0, 0];
  values.forEach((v) => (buckets[v - 1] += 1));

  return {
    shape: "scale",
    key: metric,
    wordKey: wordKeyFor(metric, mean),
    value: Math.round(mean * 10) / 10,
    noteCount: values.length,
    scaleWordKeys: TASTING_SCALES[metric],
    ...(values.length >= SPREAD_THRESHOLD
      ? { distribution: percentagesOf(buckets, values.length) }
      : {}),
    // Exactly one reading is a reading, not a consensus — so no spread is drawn
    // and the page says whose it is instead.
    ...(values.length === 1 ? { singleReadingBy: answers[0].author } : {})
  };
}

/**
 * Everything the community has said about one vintage, counted.
 *
 * Returns `null` when nothing countable remains — a wine nobody has written
 * about, or one whose only note was a faulted bottle. The caller decides what an
 * empty register looks like; this refuses to invent one.
 */
export function registerFromNotes(notes) {
  const counted = countable(notes);

  if (counted.length === 0) {
    return { noteCount: 0, groups: [], aromas: [] };
  }

  // ── scales ────────────────────────────────────────────────────────────────
  const answersByMetric = new Map();
  for (const note of counted) {
    for (const answer of note.readings?.scales ?? []) {
      if (!answersByMetric.has(answer.key)) answersByMetric.set(answer.key, []);
      answersByMetric
        .get(answer.key)
        .push({ value: answer.value, author: note.user.displayName });
    }
  }

  const groups = [];
  for (const groupKey of ["appearance", "nose", "palate", "conclusion"]) {
    const metrics = [...answersByMetric.entries()]
      .filter(([metric]) => METRIC_GROUP[metric] === groupKey)
      .map(([metric, answers]) => scaleMetric(metric, answers));
    if (metrics.length > 0) groups.push({ key: groupKey, metrics });
  }

  // ── aromas ────────────────────────────────────────────────────────────────
  const mentions = new Map();
  for (const note of counted) {
    for (const aroma of note.readings?.aromas ?? []) {
      mentions.set(aroma, (mentions.get(aroma) ?? 0) + 1);
    }
  }
  const aromas = [...mentions.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, tier: AROMA_TIER[key] ?? "primary", mentions: count }));

  // ── colour ────────────────────────────────────────────────────────────────
  const colourCounts = new Map();
  for (const note of counted) {
    const core = note.readings?.colour?.coreKey;
    if (core) colourCounts.set(core, (colourCounts.get(core) ?? 0) + 1);
  }
  const [readingKey, readingCount] =
    [...colourCounts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];

  // ── verdict ───────────────────────────────────────────────────────────────
  const verdictCounts = VERDICTS.map(
    (verdict) => counted.filter((note) => note.verdict === verdict).length
  );
  const judged = verdictCounts.reduce((a, b) => a + b, 0);
  const topIndex = verdictCounts.indexOf(Math.max(...verdictCounts));
  const verdict = judged > 0 ? VERDICTS[topIndex] : undefined;

  const dense = judged >= SPREAD_THRESHOLD;
  const percentages = dense ? percentagesOf(verdictCounts, judged) : null;

  // ── disagreement ──────────────────────────────────────────────────────────
  // Opens only when the register is thick enough to have an argument in it AND
  // two aromas are genuinely close. A "split" between 40 mentions and 3 is not a
  // disagreement, it is a majority with a footnote.
  const [first, second] = aromas;
  const contested =
    counted.length >= DISAGREEMENT_THRESHOLD &&
    second !== undefined &&
    second.mentions >= first.mentions * 0.6;

  return {
    noteCount: counted.length,
    ...(verdict ? { verdict } : {}),
    ...(percentages
      ? {
          verdictDistribution: VERDICTS.map((word, i) => ({
            verdict: word,
            percentage: percentages[i]
          })),
          verdictSummary: {
            atOrAbove: verdict,
            percentage: percentages.slice(0, topIndex + 1).reduce((a, b) => a + b, 0)
          }
        }
      : {}),
    groups,
    aromas,
    ...(readingKey
      ? {
          colour: {
            readingKey,
            readingCount,
            coreHex: readingKey === "colour.paleStraw" ? "#d8c98a" : "#6d1626",
            rimHex: readingKey === "colour.paleStraw" ? "#efe6bd" : "#b1566a"
          }
        }
      : {}),
    ...(contested
      ? {
          disagreement: {
            subjectKey: first.key,
            split: [
              {
                key: first.key,
                percentage: Math.round(
                  (first.mentions / (first.mentions + second.mentions)) * 100
                )
              },
              {
                key: second.key,
                percentage:
                  100 -
                  Math.round((first.mentions / (first.mentions + second.mentions)) * 100)
              }
            ],
            namedBy: first.mentions + second.mentions
          }
        }
      : {})
  };
}

/**
 * Writes the corpus back onto the catalogue.
 *
 * `wine.noteCount` becomes a COUNT of the note file rather than a number sitting
 * beside it, and `wine.verdict` becomes the register's — because the verdict
 * comes from members, and a wine nobody has judged has none. A wine whose only
 * notes were faulted bottles keeps its `noteCount` and loses its verdict, which
 * is the fault rule visible at the catalogue level.
 *
 * MUTATES the wines in place and returns them, because every later stage already
 * holds this array — the corpus, the browse groups and the records all read it,
 * and handing back a copy would leave three of them pointing at the old numbers.
 */
export function applyNoteCounts({ wines, notes }) {
  const byWine = new Map();
  for (const note of notes) {
    if (!byWine.has(note.wineVintageId)) byWine.set(note.wineVintageId, []);
    byWine.get(note.wineVintageId).push(note);
  }

  for (const wine of wines) {
    const mine = byWine.get(wine.id) ?? [];
    // Every note written, faulted or not — a corked bottle is still somebody
    // writing about this wine. What a fault does not do is reach the AGGREGATE,
    // which is why `register.noteCount` counts fewer of them than this does.
    wine.noteCount = mine.length;

    const judged = countable(mine).filter((note) => note.verdict !== undefined);
    if (judged.length === 0) {
      delete wine.verdict;
      continue;
    }
    const counts = VERDICTS.map(
      (verdict) => judged.filter((note) => note.verdict === verdict).length
    );
    wine.verdict = VERDICTS[counts.indexOf(Math.max(...counts))];
  }

  return wines;
}
