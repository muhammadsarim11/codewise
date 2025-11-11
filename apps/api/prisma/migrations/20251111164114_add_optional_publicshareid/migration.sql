/*
  Warnings:

  - A unique constraint covering the columns `[publicShareId]` on the table `CodeExplanation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CodeExplanation" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicShareId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CodeExplanation_publicShareId_key" ON "CodeExplanation"("publicShareId");
