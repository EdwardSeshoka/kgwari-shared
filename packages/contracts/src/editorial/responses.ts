import type { EditorialDetailContract } from "./detail.js";

/**
 * Response body of the editorial detail endpoint. `null` when the piece is not
 * published or does not exist — the two are the same fact to a reader.
 */
export type GetEditorialDetailResponse = {
  item: EditorialDetailContract | null;
};
