export interface UpsertDraftRequest {
    draft_type: string;
    scoring_type: string;
    pick_time_seconds: number;
    team_count: number;
    pointguard_slots: number;
    shootingguard_slots: number;
    guard_slots: number;
    smallforward_slots: number;
    powerforward_slots: number;
    forward_slots: number;
    center_slots: number;
    utility_slots: number;
    bench_slots: number;
    scheduled_by_user_id: number;
    scheduled_by_username: string;
    invited_user_ids: number[];
}