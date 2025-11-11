/*
  Warnings:

  - You are about to drop the column `explanationText` on the `CodeExplanation` table. All the data in the column will be lost.
  - Added the required column `explanationDoc` to the `CodeExplanation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CodeExplanation" DROP COLUMN "explanationText",
ADD COLUMN     "explanationDoc" JSONB NOT NULL;
