-- AlterTable
ALTER TABLE "users" ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "reset_token_expiry" TIMESTAMPTZ(6);

-- AddForeignKey
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_instruments_fk" FOREIGN KEY ("instrument_id") REFERENCES "instruments"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
