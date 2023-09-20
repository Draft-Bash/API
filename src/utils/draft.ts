export interface DraftTurn {
    username: string;
    draft_order_id: number;
    user_id: number;
    draft_id: number;
    bot_number: number;
    pick_number: number;
    is_picked: boolean;
}