-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_plan_id_fkey";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "investment_plan_id" UUID;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_email_verified" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_investment_plan_id_fkey" FOREIGN KEY ("investment_plan_id") REFERENCES "investment_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
