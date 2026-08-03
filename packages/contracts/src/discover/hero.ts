import type { RegionContract } from "../provenance/index.js";
import type { EditorialContract } from "../editorial/index.js";
import type { DiscoverFeature } from "./feature.js";
import type { DiscoverNoteHeroContract } from "./noteHero.js";
import type { DiscoverWineHeroContract } from "./wineHero.js";

/**
 * The hero is a featured domain entity carrying the canonical contract of
 * whatever it features, plus a little editorial framing.
 */
export type DiscoverHero =
  | DiscoverWineHeroContract
  | DiscoverNoteHeroContract
  | { kind: "region"; feature?: DiscoverFeature; region: RegionContract }
  | { kind: "editorial"; feature?: DiscoverFeature; editorial: EditorialContract };
