import type { TransactedMoneyContract as TransactedMoneyContractShape } from "../money.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";


export const TransactedMoneyContract = {
  StubFactory: {
    ...defineStub<TransactedMoneyContractShape>({
        amountMinorUnits: 89500,
        currency: "ZAR",
        asOf: "2026-06-23T10:15:30.000Z"}),
  }
};
