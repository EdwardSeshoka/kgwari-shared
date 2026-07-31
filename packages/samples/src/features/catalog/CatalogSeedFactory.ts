import type {
  GetWineRecordResponse,
  GetWineResponse,
  ListWinesResponse
} from "@edwardseshoka/contracts/catalog";

import { createWineRecord } from "./wineRecords.js";
import { createWines } from "./wines.js";

/**
 * The catalogue's sample data, shaped as the API actually answers.
 *
 * **One method per endpoint, returning that endpoint's response contract.** The
 * pools underneath (`wines.json`, `wine-records.json`) stay pools, because a
 * parameterised endpoint has one response per parameter and ninety-three files
 * would be a worse way to say the same thing. What is modelled per call is the
 * *method*, which is where a reader actually asks "what does `GET /wines`
 * return?".
 *
 * **A Factory, not a Service.** The taxonomy reserves "Service" for the HTTP
 * edge that speaks DTOs, and nothing here makes a call — it builds objects from
 * static JSON. Naming it a service would have described what its output LOOKS
 * like rather than what it does, and the same reasoning would make every
 * constructor a service.
 *
 * The method names still mirror the API, because that is the question a reader
 * arrives with: "what does `GET /wines` return?". Bridging these responses to
 * domain entities is a repository's job, one layer up, in whichever app
 * consumes this.
 *
 * That is what lets one definition serve both sides: the backend's seed writes
 * these responses into DynamoDB through its own mappers, and the frontend's app
 * doubles return them directly. Neither owns a private copy, so a wine opened
 * from a seeded backend and the same wine in a local double are the same wine.
 */
export const CatalogSeedFactory = {
  /** `GET /wines` — the catalogue. */
  listWines(): ListWinesResponse {
    return { items: createWines() };
  },

  /** `GET /wines/{id}` */
  getWine(wineVintageId: string): GetWineResponse {
    return { item: createWines().find((wine) => wine.id === wineVintageId) ?? null };
  },

  /**
   * `GET /wines/{id}/record` — the detail document.
   *
   * Returns the card AND the record together, matching the contract: opening a
   * wine from a deep link is one round trip rather than two.
   */
  getWineRecord(wineVintageId: string): GetWineRecordResponse {
    return {
      item: createWines().find((wine) => wine.id === wineVintageId) ?? null,
      record: createWineRecord(wineVintageId)
    };
  },

  /**
   * `GET /wines/featured`
   *
   * Typed as {@link GetWineResponse} because that is what it is — one wine or
   * none. There is no dedicated contract and there should not be: a response
   * type per endpoint that returns the same shape is duplication, not clarity.
   */
  getFeaturedWine(): GetWineResponse {
    return { item: createWines().find((wine) => wine.isFeatured) ?? null };
  }
} as const;
