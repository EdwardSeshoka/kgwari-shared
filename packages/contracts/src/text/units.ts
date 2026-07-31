/**
 * The units a {@link Measurement} can be denominated in.
 *
 * `14.21 %` is not a string — it is a number, a unit and a decimal separator
 * that is a comma for most of this catalogue's members. The unit travels as a
 * key so the presentation edge renders it per locale, and a market that measures
 * differently can differ without a new contract.
 *
 * Lives in `text` beside {@link Measurement} rather than in `catalog`, because
 * `text` is layer 0 and may not import from a feature. A unit is a rendering
 * concern, not a catalogue one — the boundary rule and the domain agree here.
 */
export const MEASUREMENT_UNITS = [
  "unit.percentAbv",
  "unit.percent",
  "unit.tonnesPerHectare",
  "unit.millilitre",
  "unit.bottles",
  "unit.vintageYear",
  "unit.months"
] as const;

export type MeasurementUnitKey = (typeof MEASUREMENT_UNITS)[number];
