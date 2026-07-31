import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { describe, it } from "node:test";

/**
 * The boundaries between feature folders, asserted rather than remembered.
 *
 * This package deliberately stays ONE package with feature folders instead of a
 * package per domain — fewer versions to publish, no cascading bumps, and
 * subpath exports already give consumers per-domain imports. The cost of that
 * choice is that nothing enforces the boundaries: a package boundary fails at
 * install time, a folder boundary fails only when somebody notices.
 *
 * These two rules buy the enforcement back. They are a test rather than an
 * eslint rule because this package has no eslint — `lint` is `tsc --noEmit` —
 * and because the layer map below reads better as data with reasons attached
 * than as config.
 *
 * Both rules were violated in practice before being written down, which is the
 * argument for having them: `provenance` imported from `catalog` for months
 * (the arrow pointed the wrong way — provenance owns appellations), and two
 * deep imports appeared the same day the fix landed.
 */

const SRC = new URL("../src/", import.meta.url).pathname;

/**
 * Which folders may depend on which.
 *
 * A folder may import only from a STRICTLY lower layer. Peers may not import
 * each other: two features that need each other are either one feature, or
 * share a vocabulary that belongs in layer 0.
 *
 * -1 — the tooling. The one folder holding no contracts at all: `defineStub` is
 *      generic over any `T` and imports nothing, so it knows no wine, no
 *      vocabulary and no carrier. Below the carriers rather than beside them,
 *      because every folder's doubles read it and it reads none of them — the
 *      same arrow the rest of this map enforces, just starting lower.
 *  0 — the carriers. HOW a string travels: canonical, chrome, negotiated, a
 *      measurement, a year range. More primitive than any vocabulary, because
 *      everything with a name needs a way to carry it — including a verdict
 *      word and a claimant's name.
 *  1 — the vocabularies. Closed value sets the whole system agrees on.
 *  2 — the features. Each owns one domain's contracts and the composition of
 *      them.
 *  3 — the composers. A folder whose own contracts are assembled OUT OF another
 *      feature's, rather than out of a vocabulary alone. Discover is the broad
 *      case — it exists to assemble many. Cellar is the narrow one: a holding is
 *      the member's own facts joined onto one catalogue wine, so it reads
 *      `catalog` and nothing reads it. Both sit above what they read, which is
 *      what keeps the arrow from ever pointing sideways.
 */
const LAYERS = {
  "test-doubles": -1,
  text: 0,
  money: 1,
  trust: 1,
  provenance: 1,
  catalog: 2,
  search: 2,
  editorial: 2,
  events: 2,
  member: 2,
  social: 2,
  cellar: 3,
  discover: 3
};

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return full.endsWith(".ts") ? [full] : [];
  });
}

/**
 * Every CROSS-FEATURE import in the package: who imports what, and how.
 *
 * The path is resolved rather than pattern-matched, because `../` means
 * different things at different depths. `search/wine.ts` importing
 * `../trust/index.js` crosses a feature boundary; `search/test-doubles/x.ts`
 * importing `../projection/index.js` does not — it is reaching a sibling inside
 * its own feature. An earlier version read both as cross-feature and reported
 * `projection` as an unknown folder, which is the test being wrong rather than
 * the code.
 */
function crossFolderImports() {
  const found = [];
  for (const folder of Object.keys(LAYERS)) {
    for (const file of sourceFiles(join(SRC, folder))) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/from "(\.\.?\/[^"]+)\.js"/g)) {
        // Where does this import actually land, relative to src/?
        const resolved = relative(SRC, join(dirname(file), match[1]));
        const [targetFolder, ...rest] = resolved.split("/");
        // Same feature — an internal arrangement this test has no opinion on.
        if (targetFolder === folder) continue;
        found.push({
          from: folder,
          to: targetFolder,
          target: rest.join("/"),
          file: file.slice(SRC.length)
        });
      }
    }
  }
  return found;
}

describe("contract folder boundaries", () => {
  it(
    "lets a folder depend only on a lower layer",
    function givenEveryCrossFolderImport_whenChecked_thenNonePointsSidewaysOrUp() {
      // Given: the layering is the whole reason one package with folders is
      // enough. An import that points up or sideways turns two folders into one
      // tangled unit, and the next reader has no way to tell which of them owns
      // what.
      for (const { from, to, file } of crossFolderImports()) {
        assert.ok(
          LAYERS[to] !== undefined,
          `${file} imports "${to}", which is not a known feature folder`
        );
        assert.ok(
          LAYERS[to] < LAYERS[from],
          `${file}: ${from} (layer ${LAYERS[from]}) may not import ${to} (layer ${LAYERS[to]}) — ` +
            `imports must point strictly down`
        );
      }
    }
  );

  it(
    "makes each folder's barrel its only entrance",
    function givenEveryCrossFolderImport_whenChecked_thenEachTargetsAnIndex() {
      // Given: a folder that can be reached file-by-file has no API, only an
      // implementation. Going through `index.ts` is what lets a feature rename,
      // split or move its files without breaking a caller that never asked to
      // know about them.
      for (const { from, to, target, file } of crossFolderImports()) {
        assert.ok(
          target === "index" || target.endsWith("/index"),
          `${file}: ${from} reaches into ${to}/${target}.ts — import from ${to}/index.js instead`
        );
      }
    }
  );

  it(
    "gives every folder in the layer map a barrel to be entered through",
    function givenEveryKnownFolder_whenChecked_thenItHasAnIndex() {
      // Given: the rule above is only enforceable if the entrance exists.
      for (const folder of Object.keys(LAYERS)) {
        assert.ok(
          sourceFiles(join(SRC, folder)).some((file) => file.endsWith("index.ts")),
          `${folder} has no index.ts, so nothing can import it correctly`
        );
      }
    }
  );

  it(
    "keeps the layer map honest about what is actually there",
    function givenTheSrcTree_whenCompared_thenEveryFolderIsMapped() {
      // Given: a new feature folder that nobody adds to LAYERS would be
      // unconstrained — the rules above would simply never see it, which is the
      // quietest possible way for this test to stop being true.
      const onDisk = readdirSync(SRC).filter((entry) =>
        statSync(join(SRC, entry)).isDirectory()
      );
      for (const folder of onDisk) {
        assert.ok(
          LAYERS[folder] !== undefined,
          `src/${folder} is not in the layer map — add it, and state which layer it belongs to`
        );
      }
    }
  );
});
