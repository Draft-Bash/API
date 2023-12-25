-- CreateTable
CREATE TABLE "drafts" (
    "draft_id" SERIAL NOT NULL,
    "draft_type" TEXT NOT NULL,
    "scoring_type" TEXT NOT NULL,
    "pick_time_seconds" INTEGER NOT NULL,
    "team_count" INTEGER NOT NULL,
    "pointguard_slots" INTEGER NOT NULL,
    "shootingguard_slots" INTEGER NOT NULL,
    "guard_slots" INTEGER NOT NULL,
    "smallforward_slots" INTEGER NOT NULL,
    "powerforward_slots" INTEGER NOT NULL,
    "forward_slots" INTEGER NOT NULL,
    "center_slots" INTEGER NOT NULL,
    "utility_slots" INTEGER NOT NULL,
    "bench_slots" INTEGER NOT NULL,
    "scheduled_by_user_id" INTEGER,

    CONSTRAINT "drafts_pkey" PRIMARY KEY ("draft_id")
);
