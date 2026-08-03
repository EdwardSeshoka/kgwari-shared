import type { NegotiatedText } from "../text/index.js";

/**
 * How an image travels on the wire.
 *
 * A carrier, not a feature — which is why it sits beside {@link ../text!text} at
 * layer 0 rather than inside whichever module happened to need a picture first.
 * A member's avatar, the photo on a tasting note and an estate's press image are
 * the same kind of thing, and the alternative to saying so once is five modules
 * each declaring `imageUrl?: string` and diverging on what they mean by it.
 *
 * ## Why not a bare url string
 *
 * The url is the least interesting part. What a reader needs is the alternative
 * text — and alt text is PROSE, written by a person in a language, which makes
 * it {@link NegotiatedText} exactly like a tasting note or an estate's essay.
 * A `string` in that position is an accessibility requirement with nowhere to
 * live, and every surface then invents its own place to put it.
 *
 * Dimensions are carried because a client that does not know them reserves the
 * wrong space and reflows the page under the reader's thumb. They are optional
 * because a legacy url genuinely may not know them, and a wrong guess is worse
 * than an absent one.
 *
 * ## What this does NOT do
 *
 * It does not replace the `imageUrl` fields already on {@link WineContract},
 * {@link EditorialContract} and {@link EventContract}. Those are catalogue and
 * editorial artwork with a working pipeline behind them, and migrating them is a
 * change to every producer of those contracts for no reader's benefit today.
 * This is the carrier for MEMBER-supplied media, where the alt text and the
 * language it was written in are facts nobody else can supply.
 */
export type MediaRefContract = {
  url: string;
  /**
   * What the image shows, for a reader who cannot see it.
   *
   * Optional, and the absence is honest rather than convenient: a member who
   * uploaded a photo without describing it has supplied no alt text, and
   * inventing one on the server would put Kgwari's words in their mouth. A
   * client renders the image as decorative in that case — which is what an
   * undescribed photo is.
   */
  alt?: NegotiatedText;
  /** Intrinsic pixel dimensions, so a client can reserve the space before load. */
  width?: number;
  height?: number;
};
