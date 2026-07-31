/**
 * How every contributing domain becomes a search row.
 *
 * Search is a **projection, not a fan-out**: the ledger holds pre-projected rows
 * from five domains in one shape, so the work happens once at write time instead
 * of on every keystroke.
 *
 * These live in `contracts` because THREE writers need them — the seed
 * generator, the backend's stream projector, and a backfill — and each having
 * its own copy is how they drift. Two of them already disagreed about whether a
 * wine with no recorded vintage is "non-vintage", and the seed shipped six false
 * claims before anyone noticed.
 *
 * ## Every input is a `Projectable*` type
 *
 * Not the domain's wire contract, even where one would fit. A projection's input
 * type IS its audit: the fields listed are exactly the fields that can reach a
 * row everyone can read. `ProjectableMember` is the clearest case — a member
 * record carries contact details, an address and coordinates, and a narrow input
 * makes their leaking structurally impossible rather than merely avoided.
 *
 * They are structural, so a wire contract or a domain entity satisfies one
 * without either side importing the other.
 */
export {
  EventToSearchRowMapper,
  type ProjectableEvent
} from "./eventToSearchRow.mapper.js";
export {
  MemberToSearchRowMapper,
  type ProjectableMember
} from "./memberToSearchRow.mapper.js";
export {
  ProducerToSearchRowMapper,
  type ProjectableProducer
} from "./producerToSearchRow.mapper.js";
export {
  RegionToSearchRowMapper,
  type ProjectableRegion
} from "./regionToSearchRow.mapper.js";
export {
  WineToSearchRowMapper,
  type ProjectableWine
} from "./wineToSearchRow.mapper.js";

/** Helpers the mappers share. Plain functions — a derivation, not a boundary. */
export { facetFor, searchRowId } from "./searchRowId.js";
export { toSearchText } from "./searchText.js";
