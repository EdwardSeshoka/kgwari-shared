import {
  AROMAS_RED,
  AROMAS_WHITE,
  BOTTLE_CONDITIONS,
  DECANT_STEPS,
  GLASS_SHAPES,
  RIM_READINGS_RED,
  RIM_READINGS_WHITE,
  TASTED_MODES,
  TASTING_SCALES
} from "@edwardseshoka/contracts/vocabulary";
import { VERDICTS } from "@edwardseshoka/contracts/trust";

import { curated } from "../curated.mjs";
import { slug } from "../data.mjs";
import { spread } from "../random.mjs";

const CURATED_NOTES = curated("notes");

/**
 * The durable tasting notes.
 *
 * ## Why this stage exists
 *
 * There were two notes in the fixture, both hand-written, neither carrying a
 * structured reading. The register could report scale means, aroma mentions and
 * a colour reading, and nothing in the corpus had ever produced one — so the
 * aggregate could only be seeded, never derived, and the capture screen the
 * readings were designed for had no data to render at all.
 *
 * ## Everything here is drawn from `spread`, never from `rnd`
 *
 * A note's readings are a fact about that note, not about when it was generated.
 * Using the shared mutable stream would mean adding one note shifted every value
 * in every stage that ran afterwards. `spread` hashes a stable string instead,
 * so this stage can grow without moving the catalogue underneath it.
 *
 * ## This corpus IS the register
 *
 * It did not used to be. A record claimed 1,480 notes, the corpus held two, and
 * the register in between was synthesised from the claim — so the fixture's
 * aggregate could not be checked against anything and the fault-exclusion rule
 * had nothing to demonstrate itself on.
 *
 * Now `buildRecords` derives every register from these notes and `applyNoteCounts`
 * writes the tally back onto the wine. The catalogue's `noteCount` is therefore
 * a COUNT of this file rather than a number beside it, which is why the numbers
 * came down by two orders of magnitude: the old ones were never counting
 * anything.
 */

const METRICS = Object.keys(TASTING_SCALES);

/**
 * How many notes a wine gets — a long tail, not a flat two each.
 *
 * The shape is the point. A register is meant to look different at one note, at
 * forty and at a hundred and twenty, and a corpus with the same depth everywhere
 * can only ever produce one of those. So a handful of wines are written about
 * heavily, most get a few, and a quarter get none at all — which is both what a
 * real catalogue looks like and the only way the fixture can carry a dense
 * register, a thin one, and an empty one at the same time.
 *
 * The thresholds these have to straddle live in `records.mjs`: a spread needs 25
 * answers to be drawn and a disagreement needs 100 to open. The flagship exists
 * to clear the second one — without it, nothing in the fixture would ever render
 * the disagreement section.
 */
function noteVolumeFor(wine, index) {
  if (index === 0) return 120;

  const band = spread(`${wine.id}depth`, 0, 99);
  if (band < 4) return 40 + spread(`${wine.id}deep`, 0, 20);
  if (band < 24) return 4 + spread(`${wine.id}mid`, 0, 8);
  if (band < 70) return 1 + spread(`${wine.id}thin`, 0, 2);
  return 0;
}

/**
 * A rung, 1–5, biased toward the middle.
 *
 * Averaging two draws pulls the distribution off the extremes, which is what
 * real answers do: a scale where every rung is equally likely produces a
 * register full of wines that are simultaneously the most tannic and the least.
 */
const rung = (key) => {
  const a = 1 + (spread(`${key}a`, 0, 4));
  const b = 1 + (spread(`${key}b`, 0, 4));
  return Math.max(1, Math.min(5, Math.round((a + b) / 2)));
};

/**
 * One member's verdict — near the wine's, not equal to it.
 *
 * The register reports a DISTRIBUTION, and a corpus where every note on a wine
 * picked the same word produces a distribution that is 100 % one rung: not a
 * spread, a column. So each note lands within one rung of the wine's centre,
 * with the centre itself most likely — which is what a room that broadly agrees
 * and occasionally does not actually looks like.
 *
 * The wine's own verdict is then re-derived FROM these in `applyNoteCounts`, so
 * this is a starting point rather than a source of truth. Where the two end up
 * disagreeing, the notes win: the verdict comes from members.
 */
const verdictFor = (wine, key) => {
  const centre = Math.max(0, VERDICTS.indexOf(wine.verdict));
  const drift = spread(`${key}vd`, 0, 9);
  const offset = drift < 6 ? 0 : drift < 8 ? -1 : 1;
  const index = Math.max(0, Math.min(VERDICTS.length - 1, centre + offset));
  return VERDICTS[index];
};

const takeAromas = (pool, key, count) => {
  const chosen = [];
  for (let i = 0; chosen.length < count && i < pool.length * 2; i += 1) {
    const candidate = pool[spread(`${key}${i}`, 0, pool.length - 1)];
    if (!chosen.includes(candidate)) chosen.push(candidate);
  }
  return chosen;
};

/**
 * The bottle's condition.
 *
 * Overwhelmingly `condition.noFaults`, and that ratio is the point: a fault is
 * rare, and a fixture where one note in seven is corked would let a consumer
 * treat faults as ordinary. One in roughly twenty carries a real fault, which is
 * enough that any aggregation ignoring the exclusion rule produces visibly wrong
 * numbers — see `FAULT_CONDITIONS`.
 */
const conditionFor = (key) => {
  const roll = spread(`${key}cond`, 0, 19);
  if (roll > 0) return "condition.noFaults";
  const faults = BOTTLE_CONDITIONS.filter((c) => c !== "condition.noFaults");
  return faults[spread(`${key}fault`, 0, faults.length - 1)];
};

function readingsFor(wine, key) {
  const white = wine.color === "white";
  const aromaPool = white ? AROMAS_WHITE : AROMAS_RED;
  const rimPool = white ? RIM_READINGS_WHITE : RIM_READINGS_RED;
  const condition = conditionFor(key);
  // A faulted bottle is not a bottle anybody finished reading. The note stands
  // and still enters the room; what it does NOT carry is a full set of answers
  // about a wine the taster never got a clean look at.
  const faulted = condition !== "condition.noFaults";

  const scales = (faulted ? METRICS.slice(0, 2) : METRICS).map((metric) => ({
    key: metric,
    value: rung(`${key}${metric}`)
  }));

  return {
    scales,
    aromas: takeAromas(aromaPool, `${key}aroma`, faulted ? 1 : 2 + spread(`${key}ac`, 0, 2)),
    colour: {
      coreKey: white ? "colour.paleStraw" : "colour.deepGarnet",
      rimKey: rimPool[spread(`${key}rim`, 0, rimPool.length - 1)]
    },
    pour: {
      tasted: TASTED_MODES[spread(`${key}sighted`, 0, 9) === 0 ? 1 : 0],
      decant: DECANT_STEPS[spread(`${key}decant`, 0, DECANT_STEPS.length - 1)],
      glass: GLASS_SHAPES[spread(`${key}glass`, 0, GLASS_SHAPES.length - 1)],
      temperature: {
        source: "measurement",
        value: white ? 8 + spread(`${key}temp`, 0, 4) : 15 + spread(`${key}temp`, 0, 4),
        unitKey: "unit.celsius"
      }
    },
    condition,
    ...(faulted
      ? {}
      : {
          drinkingWindow: {
            window: {
              source: "yearRange",
              from: (wine.vintage ?? 2020) + 2 + spread(`${key}from`, 0, 3),
              to: (wine.vintage ?? 2020) + 10 + spread(`${key}to`, 0, 8)
            },
            atPeak: spread(`${key}peak`, 0, 2) === 0
          }
        })
  };
}

/**
 * Notes across the catalogue, two per wine for the first slice of it.
 *
 * The curated pair comes first and VERBATIM, for the reason every stage keeps
 * its curated rows: `orig-wine-records.json` names `note_alexandra_rubicon_2018`
 * as a record's featured note, so regenerating that id would leave the record
 * pointing at nothing — the exact failure the curated-first rule was written
 * after.
 */
export function buildNotes({ wines, users }) {
  const curatedIds = new Set(CURATED_NOTES.map((n) => n.id));
  const generated = [];

  for (let w = 0; w < wines.length; w += 1) {
    const wine = wines[w];
    for (let n = 0; n < noteVolumeFor(wine, w); n += 1) {
      // The author rotates by a stride coprime with the member count, so a wine
      // with a hundred notes has a hundred DIFFERENT authors rather than the same
      // dozen cycling — the register counts members, and a fixture where one
      // person wrote a fifth of them is not the shape it aggregates.
      const user = users[(w * 7 + n * 13) % users.length];
      const key = `${wine.id}${user.id}${n}`;
      const id = `note_${slug(user.displayName)}_${wine.id}_${n}`;
      if (curatedIds.has(id)) continue;

      const readings = readingsFor(wine, key);
      const faulted = readings.condition !== "condition.noFaults";
      // A note kept out of the room is still a genuine reading and still
      // aggregates — visibility governs whose name appears, not whether the
      // observation counts. Roughly one in eight, so consumers meet the case.
      const isPrivate = spread(`${key}vis`, 0, 7) === 0;

      generated.push({
        id,
        wineVintageId: wine.id,
        wine: {
          id: wine.id,
          ...(wine.wineLabelId ? { wineLabelId: wine.wineLabelId } : {}),
          name: wine.name,
          ...(wine.estate ? { producerName: wine.estate } : {}),
          ...(wine.vintage ? { vintage: wine.vintage, vintageDisplay: String(wine.vintage) } : {})
        },
        user: {
          id: user.id,
          displayName: user.displayName,
          initials: user.initials,
          ...(user.status ? { status: user.status } : {}),
          ...(user.role ? { tier: "professional", role: user.role } : {})
        },
        // A faulted bottle gets no verdict. The wine did not do anything to earn
        // one, which is the invariant stated the other way round: a fault never
        // counts against the record.
        ...(faulted ? {} : { verdict: verdictFor(wine, key) }),
        note: faulted
          ? `Bottle was not right — filing it so the evening is on record.`
          : `${wine.name} from ${wine.region}. ${readings.aromas.length} things worth naming, and a finish that kept going.`,
        // Spread across the month by NOTE rather than by wine, so a wine with a
        // hundred notes did not collect them all on one evening. `tastedAt` and
        // `createdAt` stay a day apart: they are different facts, and a fixture
        // where they are always equal lets a consumer treat them as one.
        tastedAt: `2026-07-${String(1 + ((w * 3 + n) % 27)).padStart(2, "0")}T19:00:00.000Z`,
        createdAt: `2026-07-${String(2 + ((w * 3 + n) % 27)).padStart(2, "0")}T09:15:00.000Z`,
        saveCount: spread(`${key}save`, 0, 120),
        languageTag: "en",
        readings,
        ...(spread(`${key}photo`, 0, 3) === 0
          ? {
              photo: {
                url: `https://images.kgwari.test/notes/${id}.jpg`,
                width: 1600,
                height: 1200
              }
            }
          : {}),
        ...(isPrivate ? { visibility: "private" } : {})
      });
    }
  }

  return [...CURATED_NOTES, ...generated];
}
