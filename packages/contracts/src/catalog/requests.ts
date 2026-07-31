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
 *
 * @deprecated The route this described is gone. `POST /wines` meant "put a wine
 * in my cellar", which is why it accepted `name`, `estate`, `region` and
 * `imageUrl` — a member filing their own idea of what a wine *is*, which then
 * diverged from the catalogue's. Cellaring is now
 * {@link ../cellar!AddCellarEntryRequest} against `POST /cellar`, and it takes a
 * `wineId` and the member's own facts only. Nothing writes to the catalogue over
 * HTTP today; when something does, it will need its own request contract rather
 * than this one.
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

/** @deprecated See {@link AddWineRequest}. */
export type AddWineResponse = {
  item: WineContract;
};
