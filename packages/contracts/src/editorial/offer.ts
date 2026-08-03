import type { EditorialOfferFormatContract } from "./offerFormat.js";
import type { EditorialOfferMarketContract } from "./offerMarket.js";

/**
 * The commercial block — what is for sale, in what formats, at what price where.
 *
 * Legal only on the types {@link EDITORIAL_PIECE_RULES} allows. A cause piece
 * carrying one is a validation error, not a block a client hides.
 */
export type EditorialOfferContract = {
  formats: EditorialOfferFormatContract[];
  markets: EditorialOfferMarketContract[];
};
