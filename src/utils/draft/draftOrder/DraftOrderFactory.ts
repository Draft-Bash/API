import { IDraftOrder } from "./IDraftOrder";
import { LinearDraftOrder } from "./LinearDraftOrder";
import { SnakeDraftOrder } from "./SnakeDraftOrder";

export class DraftOrderFactory {
    public createDraftOrder(type: string): IDraftOrder {
        switch (type) {
            case "snake":
                return new SnakeDraftOrder();
            case "linear":
                return new LinearDraftOrder();
            default:
                return new SnakeDraftOrder();
        }
    }
}