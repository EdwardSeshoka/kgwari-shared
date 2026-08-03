import { LENS_ALL } from "@edwardseshoka/contracts/lenses";

/**
 * Builds a chip row from the lens each row actually falls under.
 *
 * The server's job, modelled once here so all four landings behave the same way
 * — and so the two rules the mechanism owes are enforced by construction rather
 * than remembered per stage:
 *
 *  - **A lens with nothing in it is never offered.** A count of zero is a chip
 *    that leads to an empty page, which is the one thing a filter must not do.
 *  - **A row where nothing NARROWS is emitted EMPTY.** A lone "All" is the
 *    obvious case and not the only one: when only the house has published,
 *    "All" and "Kgwari" select the same rows, and a second chip that changes
 *    nothing is as useless as a first one that does. The row is drawn only when
 *    at least two lenses have something of their own to say — which is the thing
 *    a tab row can never do.
 *
 * @param assigned  the lens key for each row in the corpus, in any order
 * @param offered   the vocabulary this list is asked, `lens.all` first
 */
export function lensRow(assigned, offered) {
  const tally = new Map();
  for (const key of assigned) tally.set(key, (tally.get(key) ?? 0) + 1);

  const narrowing = offered
    .filter((key) => key !== LENS_ALL)
    .map((key) => ({ key, count: tally.get(key) ?? 0 }))
    .filter((lens) => lens.count > 0);

  // One populated bucket means that bucket IS the corpus. Emitting it anyway
  // would push the suppression decision into every client.
  if (narrowing.length < 2) return { lenses: [], active: LENS_ALL };

  return {
    lenses: [{ key: LENS_ALL, count: assigned.length }, ...narrowing],
    active: LENS_ALL
  };
}
