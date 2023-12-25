import { DraftInvite } from "../../api/drafts/contracts/dataTypes/DraftInvite";

export interface IDraftInviteEmailer {
    send(users: DraftInvite[], sent_by_username: string): Promise<void>;
}