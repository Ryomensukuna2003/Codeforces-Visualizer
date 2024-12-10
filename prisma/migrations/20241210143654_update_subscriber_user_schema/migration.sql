/*
  Warnings:

  - You are about to drop the column `otp` on the `Subscriber` table. All the data in the column will be lost.
  - You are about to drop the column `otpExpiry` on the `Subscriber` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Subscriber` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `Subscriber` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscriber" DROP COLUMN "otp",
DROP COLUMN "otpExpiry",
DROP COLUMN "updatedAt",
DROP COLUMN "verified";
