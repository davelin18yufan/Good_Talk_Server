/*
  Warnings:

  - You are about to drop the column `createdAt` on the `benchmarks` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `benchmarks` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `user_goals` table. All the data in the column will be lost.
  - You are about to drop the column `currentAmount` on the `user_goals` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `user_goals` table. All the data in the column will be lost.
  - You are about to drop the column `targetAmount` on the `user_goals` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user_goals` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_goals` table. All the data in the column will be lost.
  - Added the required column `target_amount` to the `user_goals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `user_goals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_goals` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_goals" DROP CONSTRAINT "user_goals_userId_fkey";

-- AlterTable
ALTER TABLE "benchmarks" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "user_goals" DROP COLUMN "createdAt",
DROP COLUMN "currentAmount",
DROP COLUMN "name",
DROP COLUMN "targetAmount",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "current_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "target_amount" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "title" VARCHAR(50) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "user_goals" ADD CONSTRAINT "user_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
