/*
  Warnings:

  - Added the required column `title` to the `module_pages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "module_pages" ADD COLUMN     "title" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "module_pages_module_id_type_idx" ON "module_pages"("module_id", "type");
