import type { EditorialDetailContract as EditorialDetailContractShape } from "../detail.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { EventContract } from "../../events/test-doubles/index.js";

/**
 * A published piece, in full.
 *
 * The factories are chosen by what the TYPE makes legal, because that is the
 * rule this contract exists to enforce (see `EDITORIAL_PIECE_RULES`) and a set
 * of doubles that only ever builds legal-everything pieces cannot test it.
 *
 * `make()` is an article carrying claims — including the one that answers a wine
 * record row, which is the reverse index and the reason claims are structured
 * rather than prose. `makeEvent()` embeds the events-domain event itself.
 * `makeCause()` is the piece that may carry neither commerce nor mentions.
 * `makeOffer()` is the per-market price table Kgwari converts nothing in.
 */
export const EditorialDetailContract = {
  StubFactory: {
    ...defineStub<EditorialDetailContractShape>({
      id: "editorial_fourteen-clones",
      contentType: "article",
      title: "Fourteen clones, one rootstock",
      titleLanguage: "en",
      standfirst: {
        source: "negotiated",
        text: "What a decade of replanting did to a hillside in Stellenbosch.",
        languageTag: "en"
      },
      body: [
        {
          source: "negotiated",
          text: "The block was pulled out in 2011 and nobody agreed about what should go back into it.",
          languageTag: "en"
        },
        {
          source: "negotiated",
          text: "Fourteen years later the argument has an answer, and it is not the one the nursery recommended.",
          languageTag: "en"
        }
      ],
      author: { name: "Alexandra Meyer", tier: "professional", role: "Sommelier" },
      subject: { kind: "wine", wineVintageId: "wine_rubicon-2018" },
      publishedAt: "2026-06-20T08:00:00.000Z",
      claims: [
        {
          id: "claim_1",
          body: {
            source: "negotiated",
            text: "The replanting used fourteen clones on a single rootstock.",
            languageTag: "en"
          },
          source: "firsthand",
          /**
           * The reverse index, populated. This is what lets the wine record's
           * varietal row read "answered by *Fourteen clones, one rootstock*"
           * instead of showing a bare Estate tag.
           */
          answers: [{ wineVintageId: "wine_rubicon-2018", fieldKey: "varietal" }]
        },
        {
          id: "claim_2",
          body: {
            source: "negotiated",
            text: "Yields have fallen by roughly a third since the replant.",
            languageTag: "en"
          },
          /**
           * A REPORTED claim answering an ESTATE-PRIVATE row — the combination
           * worth having a double for. Yield is a fact only the producer holds,
           * so the piece is how it reaches the record at all, and the row must
           * still say it was taken on the estate's word rather than measured.
           */
          source: "reported",
          answers: [{ wineVintageId: "wine_rubicon-2018", fieldKey: "yield" }]
        }
      ],
      unanswered: [
        {
          question: {
            source: "negotiated",
            text: "What did the replanting cost?",
            languageTag: "en"
          },
          answer: "declined"
        },
        {
          question: {
            source: "negotiated",
            text: "Which nursery supplied the material?",
            languageTag: "en"
          },
          /**
           * Never asked — and the honest answer, which is exactly the one a
           * nullable field used to disguise as a refusal or as silence.
           */
          answer: "not_sought"
        }
      ],
      saveCount: 41
    }),

    /**
     * An event announcement, embedding the events-domain event.
     *
     * Composed from the published event double rather than a literal: one dinner,
     * two surfaces, and a field that moves on `EventContract` must break this
     * piece at compile time rather than leave two copies disagreeing about when
     * it starts.
     */
    makeEvent(
      overrides: Overrides<EditorialDetailContractShape> = {}
    ): EditorialDetailContractShape {
      return EditorialDetailContract.StubFactory.make({
        id: "editorial_kanonkop-vertical-announced",
        contentType: "event",
        title: "Six vintages, one evening",
        event: EventContract.StubFactory.make(),
        claims: undefined,
        unanswered: undefined,
        ...overrides
      });
    },

    /**
     * A cause piece: no offer, no pairing, no wine mentions.
     *
     * The validation case. A piece about a relief fund that also sells you a case
     * is not a cause piece, and a consumer that renders a commercial block
     * wherever it finds one has never been handed the piece that must not have
     * had one to find.
     */
    makeCause(
      overrides: Overrides<EditorialDetailContractShape> = {}
    ): EditorialDetailContractShape {
      return EditorialDetailContract.StubFactory.make({
        id: "editorial_after-the-fire",
        contentType: "cause",
        title: "After the fire",
        subject: undefined,
        claims: undefined,
        offer: undefined,
        pairing: undefined,
        ...overrides
      });
    },

    /**
     * A release with a per-market price table.
     *
     * Two markets, and the second has NO price with a stated reason — because
     * absence is a statement here as everywhere on the record, and "no price"
     * without a reason is the one thing a reader cannot act on. Nothing is
     * converted between them.
     */
    makeOffer(
      overrides: Overrides<EditorialDetailContractShape> = {}
    ): EditorialDetailContractShape {
      return EditorialDetailContract.StubFactory.make({
        id: "editorial_rubicon-2021-release",
        contentType: "offer",
        title: "Rubicon 2021, released",
        offer: {
          formats: [
            {
              name: { source: "canonical", text: "Bottle" },
              volume: { source: "measurement", value: 750, unitKey: "unit.millilitre" }
            },
            {
              name: { source: "canonical", text: "Magnum" },
              volume: { source: "measurement", value: 1500, unitKey: "unit.millilitre" }
            }
          ],
          markets: [
            {
              countryCode: "ZA",
              price: { amountMinorUnits: 89000, currency: "ZAR" }
            },
            {
              countryCode: "GB",
              absenceReason: "not_distributed",
              clubOnly: false
            }
          ]
        },
        pairing: {
          dish: {
            source: "negotiated",
            text: "Lamb off the coals, more smoke than sauce.",
            languageTag: "en"
          },
          suggestedBy: { name: "Chris Williams", tier: "producer", role: "Cellarmaster" }
        },
        ...overrides
      });
    }
  }
};
