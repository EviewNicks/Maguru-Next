/*
  Warnings:

  - You are about to drop the column `language` on the `module_pages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "module_pages" DROP COLUMN "language",
ADD COLUMN     "status" "ModuleStatus" NOT NULL DEFAULT 'DRAFT';
