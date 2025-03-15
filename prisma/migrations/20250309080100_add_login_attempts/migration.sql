-- DropForeignKey
ALTER TABLE "holdings" DROP CONSTRAINT "holdings_instrument_id_fkey";

-- DropForeignKey
ALTER TABLE "investment_plans" DROP CONSTRAINT "instrument_plans_instrument_id_fkey";

-- DropForeignKey
ALTER TABLE "monthly_performance" DROP CONSTRAINT "monthly_performance_best_instrument_fkey";

-- DropForeignKey
ALTER TABLE "monthly_performance" DROP CONSTRAINT "monthly_performance_worst_instrument_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_instrument_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "yearly_performance" DROP CONSTRAINT "yearly_performance_best_instrument_fkey";

-- DropForeignKey
ALTER TABLE "yearly_performance" DROP CONSTRAINT "yearly_performance_worst_instrument_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "last_failed_login" TIMESTAMPTZ(6),
ADD COLUMN     "login_attempts" INTEGER NOT NULL DEFAULT 0;
