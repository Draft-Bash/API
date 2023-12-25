/*
  Warnings:

  - You are about to drop the column `bot_number` on the `draft_orders` table. All the data in the column will be lost.
  - Added the required column `team_number` to the `draft_orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "draft_orders" DROP COLUMN "bot_number",
ADD COLUMN     "team_number" INTEGER NOT NULL;
