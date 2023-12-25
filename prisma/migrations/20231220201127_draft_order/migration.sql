-- CreateTable
CREATE TABLE "draft_users" (
    "user_id" INTEGER NOT NULL,
    "draft_id" INTEGER NOT NULL,
    "is_autodraft_on" BOOLEAN NOT NULL,
    "is_invite_read" BOOLEAN NOT NULL,
    "is_invite_accepted" BOOLEAN NOT NULL,

    CONSTRAINT "draft_users_pkey" PRIMARY KEY ("user_id","draft_id")
);

-- CreateTable
CREATE TABLE "draft_orders" (
    "draft_order_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "draft_id" INTEGER NOT NULL,
    "bot_number" INTEGER NOT NULL,
    "pick_number" INTEGER NOT NULL,

    CONSTRAINT "draft_orders_pkey" PRIMARY KEY ("draft_order_id")
);

-- AddForeignKey
ALTER TABLE "draft_users" ADD CONSTRAINT "draft_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_users" ADD CONSTRAINT "draft_users_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "drafts"("draft_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_scheduled_by_user_id_fkey" FOREIGN KEY ("scheduled_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_orders" ADD CONSTRAINT "draft_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_orders" ADD CONSTRAINT "draft_orders_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "drafts"("draft_id") ON DELETE RESTRICT ON UPDATE CASCADE;
