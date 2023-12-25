/*
  Warnings:

  - You are about to drop the column `is_invite_accepted` on the `draft_users` table. All the data in the column will be lost.
  - You are about to drop the column `is_invite_read` on the `draft_users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "draft_users" DROP COLUMN "is_invite_accepted",
DROP COLUMN "is_invite_read";
