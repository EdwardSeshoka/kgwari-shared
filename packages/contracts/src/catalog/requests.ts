import type {
  MoneyContract,
  WineContract,
  WineLocationContract
} from "./wine.js";
import type { WineRecordContract } from "./record.js";

export type ListWinesResponse = {
  items: WineContract[];
};

export type GetWineResponse = {
  item: WineContract | null;
};

/**
 * The detail document for one vintage — fetched separately from the card so the
 * ninety-odd fields of a record never ride along in a list response.
 *
 * `item` is the card shape the client already holds from a list; `record` is the
 * document. Both come back together so opening a wine from a deep link is one
 * round trip rather than two.
 */
export type GetWineRecordResponse = {
  item: WineContract | null;
  record: WineRecordContract | null;
};

/**
 * Body accepted by `POST /wines`. Server derives `id` and owner; the write
 * contract is intentionally stricter than the read {@link WineContract}.
 */
export type AddWineRequest = {
  name: string;
  estate: string;
  vintage?: number;
  year?: number;
  region: string;
  location: WineLocationContract;
  imageUrl: string;
  description: string;
  price: MoneyContract;
  isFeatured: boolean;
};

export type AddWineResponse = {
  item: WineContract;
};
