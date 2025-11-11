-- DropForeignKey
ALTER TABLE "public"."CodeExplanation" DROP CONSTRAINT "CodeExplanation_projectId_fkey";

-- AlterTable
ALTER TABLE "CodeExplanation" ADD COLUMN     "aiModel" TEXT,
ADD COLUMN     "complexity" TEXT,
ADD COLUMN     "improvements" TEXT[],
ADD COLUMN     "keyPoints" TEXT[],
ALTER COLUMN "projectId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CodeExplanation" ADD CONSTRAINT "CodeExplanation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
