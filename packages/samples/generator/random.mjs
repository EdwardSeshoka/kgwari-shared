/**
 * The deterministic pseudo-random stream every stage draws from.
 *
 * **One shared, mutable counter — which is why stage ORDER is load-bearing.**
 * `index.mjs` runs the stages in a fixed sequence, and each draw advances this
 * seed for whatever runs next. Reorder two stages and every generated value
 * downstream changes, silently and completely: not a crash, just a different
 * catalogue with different ids that nothing outside still points at.
 *
 * Deterministic on purpose. A generator using `Math.random()` produces a
 * different corpus on every run, so `--check` could never tell a hand-edit from
 * a re-roll, and no seed id could be referenced from anywhere else.
 */
let seed = 20260730;

export const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
export const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
export const int = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

/**
 * Order-independent hash, for values that must NOT depend on when they were
 * generated — a wine's ABV is a fact about that wine, not about its position in
 * the run. Unlike `rnd`, calling this never advances the seed, so a stage can
 * draw from it without shifting everything downstream.
 */
const hash = (s) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
};

export const spread = (s, lo, hi) => lo + (hash(s) % (hi - lo + 1));
