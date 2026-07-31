/**
 * Protected-origin systems, by country.
 *
 * Lives in **provenance**, not catalog. It moved because the dependency pointed
 * the wrong way: an origin system is a certification scheme that appellations
 * are granted under, and provenance owns appellations — catalog's own
 * {@link ../catalog!WineAppellationRefContract} calls itself "a denormalized
 * reference… the full record lives in provenance". So catalog referencing
 * provenance is the domain relationship; provenance reaching into catalog for
 * the scheme its own appellations are defined by was the inversion.
 */
export type WineOriginSystemContract =
  | "WO" // South Africa — Wine of Origin
  | "AOC" // France — Appellation d'Origine Contrôlée
  | "AOP" // France / EU — Appellation d'Origine Protégée
  | "DOC" // Italy — Denominazione di Origine Controllata
  | "DOCG" // Italy — …e Garantita
  | "DO" // Spain — Denominación de Origen
  | "DOCa" // Spain — …Calificada
  | "AVA" // USA — American Viticultural Area
  | "GI" // Australia — Geographical Indication
  | "Other";

/**
 * A protected-origin appellation — WO Stellenbosch, AOC Pauillac, DOCG Barolo,
 * Napa Valley AVA. Distinct from a {@link RegionContract}: an appellation is the
 * legal origin denomination, tied to a region and a country's origin `system`,
 * and can nest (e.g. an AVA within an AVA) via `parentAppellationId`.
 */
export type AppellationContract = {
  id: string;
  name: string;
  countryCode: string;
  regionId: string;
  system: WineOriginSystemContract;
  parentAppellationId?: string;
  description?: string;
};

/**
 * The protected-origin system a country certifies under.
 *
 * Lives beside {@link WineOriginSystemContract} because it PRODUCES one, and
 * that is the whole point: this mapping previously sat in the seed generator,
 * where an earlier version returned `"PDO"` — a real EU term, and not a member
 * of this union. Every German, Swiss, British and Canadian wine then failed the
 * record mapper, and it was a contract test that caught it rather than anything
 * near the code at fault. Declared here, an invalid system does not compile.
 *
 * `Other` is the honest answer for a country outside the schemes this union
 * names — Switzerland, the UK and Canada all certify differently — rather than
 * forcing every wine into a system that does not apply to it.
 */
const ORIGIN_SYSTEM_BY_COUNTRY: Readonly<Record<string, WineOriginSystemContract>> = {
  ZA: "WO",
  FR: "AOC",
  IT: "DOCG",
  ES: "DO",
  DE: "AOP", // EU-wide protected designation
  AT: "AOP",
  US: "AVA"
};

export function originSystemFor(countryCode: string): WineOriginSystemContract {
  return ORIGIN_SYSTEM_BY_COUNTRY[countryCode] ?? "Other";
}
