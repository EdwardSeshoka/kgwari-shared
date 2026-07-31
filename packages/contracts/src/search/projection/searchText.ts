import type { SearchResultContract } from "../search.js";

/**
 * The words a row can be found by, lower-cased and joined once at write time.
 *
 * **The single definition of what makes a row findable.** Every writer — a seed
 * generator, a stream projector, a backfill — must derive it through here, or
 * rows written by one path become unfindable by a query served from another.
 *
 * Only text a member could plausibly type goes in. Chrome keys DO go in: a
 * member searching "sommelier" in English should find one, and the key happens
 * to be the English word. That is a limitation of a substring engine rather than
 * a design — a French member typing the French word will not match until a real
 * index with per-locale synonyms answers the query.
 *
 * Prices are excluded. "895" matching a row is noise, not recall — nobody
 * searches a catalogue by typing an amount, and the digits collide with vintages.
 */
export function toSearchText(row: SearchResultContract): string {
  const parts: string[] = [];
  const push = (value: string | undefined) => {
    if (value && value.trim()) parts.push(value.trim());
  };

  // A title is canonical or negotiated, never chrome — no entity is named by an
  // enum, and the type proves it, so there is no chrome branch to guard.
  push(row.title.text);
  if (row.eyebrow) {
    push(row.eyebrow.source === "chrome" ? row.eyebrow.key : row.eyebrow.text);
  }
  push(row.verdict);
  push(row.kind);

  if (row.meta?.kind === "vintage") push(String(row.meta.year));
  if (row.meta?.kind === "nonVintage") push("NV");
  if (row.meta?.kind === "estate" && row.meta.foundedYear) push(String(row.meta.foundedYear));

  return parts.join(" ").toLowerCase();
}
