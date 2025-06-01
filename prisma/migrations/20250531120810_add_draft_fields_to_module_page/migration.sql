-- AlterTable
ALTER TABLE "module_pages" ADD COLUMN     "authorId" TEXT,
ADD COLUMN     "draftData" JSONB,
ADD COLUMN     "draftSavedAt" TIMESTAMP(3),
ADD COLUMN     "hasUnpublishedChanges" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastEditBy" TEXT;

-- CreateIndex
CREATE INDEX "module_pages_authorId_idx" ON "module_pages"("authorId");
