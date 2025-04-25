-- AddForeignKey
ALTER TABLE "investment_plans" ADD CONSTRAINT "investment_plans_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "instruments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
