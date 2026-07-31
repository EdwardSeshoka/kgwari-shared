import { readFileSync, writeFileSync } from "node:fs";

const OUT = new URL("../src/features/", import.meta.url).pathname;

/**
 * Writes the seeds, or — with `--check` — regenerates in memory and reports what
 * drifted.
 *
 * `--check` is what makes "never hand-edit a generated seed" a rule the build
 * enforces rather than one everyone has to remember. A hand-edit now fails CI
 * with the file named, which is how the discover hero broke silently the last
 * time a generated file was treated as editable.
 */
export function emitter({ check }) {
  const drifted = [];

  const write = (path, data) => {
    const next = JSON.stringify(data, null, 2) + "\n";
    if (!check) return writeFileSync(`${OUT}${path}`, next);
    if (readFileSync(`${OUT}${path}`, "utf8") !== next) drifted.push(path);
  };

  const report = () => {
    if (!check) return;
    if (drifted.length) {
      console.error("Seeds are out of date — these files do not match the generator:");
      drifted.forEach((p) => console.error(`  src/features/${p}`));
      console.error("Run: npm run generate:seeds --workspace @edwardseshoka/samples");
      process.exit(1);
    }
    console.log("seeds up to date");
  };

  return { write, report };
}
