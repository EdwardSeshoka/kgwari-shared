/**
 * Editorial framing for a hero, as data — eyebrow text, a label, an issue
 * volume. Formatting (figure labels, line breaks, cta styles) is applied on the
 * client.
 */
export type DiscoverFeature = {
  eyebrow?: string;
  label?: string;
  volume?: number;
};
