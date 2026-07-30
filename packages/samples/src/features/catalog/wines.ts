import type { WineContract } from "@edwardseshoka/contracts/catalog";

import rawWines from "./wines.json" with { type: "json" };

const wines = rawWines as WineContract[];

/**
 * The wine catalogue — the same `WineContract` shape the catalog api serves.
 *
 * Not "public wines". Signing in does not change which wines exist; it changes
 * what a member can DO with them (add to a cellar, write a note) and what
 * ADDITIONAL data they see. The catalogue is one catalogue, so the qualifier was
 * describing a storage partition rather than a kind of wine.
 */
export function createWines(): WineContract[] {
  return wines;
}
