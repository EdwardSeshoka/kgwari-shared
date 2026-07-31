import { IMAGES } from "../images.mjs";
import { PRODUCERS, slug } from "../data.mjs";

/** The estates. Every one must resolve to a region, or the corpus would dangle. */
export function buildProducers({ regionByName }) {
  const producers = PRODUCERS.map(([name, regionName, founded, wineCount], i) => {
    const region = regionByName.get(regionName);
    if (!region) throw new Error(`producer ${name}: unknown region ${regionName}`);
    return {
      id: `estate_${slug(name)}`,
      name,
      countryCode: region.countryCode,
      regionId: region.id,
      regionName: region.name,
      foundedYear: founded,
      imageUrl: IMAGES[i % IMAGES.length],
      description: `${name}, ${region.name}.`,
      wineCount,
    };
  });

  return producers;
}
