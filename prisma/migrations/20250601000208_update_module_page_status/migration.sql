/*
  Warnings:

  - The `status` column on the `module_pages` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ModulePageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "module_pages" DROP COLUMN "status",
ADD COLUMN     "status" "ModulePageStatus" NOT NULL DEFAULT 'DRAFT';
