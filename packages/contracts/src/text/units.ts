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
  "unit.months",
  /**
   * Serving temperature, in the scale it was actually recorded in.
   *
   * BOTH scales, rather than one canonical unit the client converts from,
   * because 18 °C and 64 °F are the same temperature but not the same fact: one
   * of them is what the member typed, and the other is a rounding of it. A
   * member who poured at 64 °F should see 64 °F back. Conversion for a reader in
   * the other market is a presentation choice and stays at the edge.
   */
  "unit.celsius",
  "unit.fahrenheit"
] as const;

export type MeasurementUnitKey = (typeof MEASUREMENT_UNITS)[number];
