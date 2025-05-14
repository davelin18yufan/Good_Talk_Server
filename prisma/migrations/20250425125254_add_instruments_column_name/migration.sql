/*
  Warnings:

  - Added the required column `name` to the `instruments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "instruments" ADD COLUMN     "name" VARCHAR(30) NOT NULL;
