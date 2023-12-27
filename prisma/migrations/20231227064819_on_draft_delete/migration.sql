-- DropForeignKey
ALTER TABLE "draft_orders" DROP CONSTRAINT "draft_orders_draft_id_fkey";

-- DropForeignKey
ALTER TABLE "draft_users" DROP CONSTRAINT "draft_users_draft_id_fkey";

-- DropForeignKey
ALTER TABLE "draft_users" DROP CONSTRAINT "draft_users_user_id_fkey";

-- AlterTable
ALTER TABLE "draft_orders" ALTER COLUMN "team_number" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "draft_users" ADD CONSTRAINT "draft_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_users" ADD CONSTRAINT "draft_users_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "drafts"("draft_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_orders" ADD CONSTRAINT "draft_orders_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "drafts"("draft_id") ON DELETE CASCADE ON UPDATE CASCADE;
