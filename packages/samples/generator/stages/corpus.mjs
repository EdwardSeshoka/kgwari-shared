import { Mapper } from "@edwardseshoka/foundation";
import {
  EventToSearchRowMapper,
  MemberToSearchRowMapper,
  ProducerToSearchRowMapper,
  RegionToSearchRowMapper,
  WineToSearchRowMapper,
} from "@edwardseshoka/contracts/search";

/**
 * The unified search ledger — projected, never constructed here.
 *
 * This stage used to build all five row shapes inline, making it a second
 * opinion about something the backend's stream projector also decides. The two
 * had already diverged: this one labelled any wine with no recorded vintage
 * "non-vintage", shipping six false claims including a Bordeaux château.
 *
 * `Mapper.flatMap` because these cannot fail — every mapper here is declared
 * `Failure = never`, so the type system guarantees there is no error to handle
 * and hands back the row directly.
 */
const project = (mapper) => (source) => Mapper.flatMap(mapper, source);

export function buildCorpus({ wines, producers, regions, events, users }) {
  return [
    ...wines.map(project(WineToSearchRowMapper)),
    ...producers.map(project(ProducerToSearchRowMapper)),
    ...regions.map(project(RegionToSearchRowMapper)),
    ...events.map(project(EventToSearchRowMapper)),
    ...users.map(project(MemberToSearchRowMapper)),
  ];
}
