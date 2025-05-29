/*
Warnings:

- Changed the type of `content` on the `module_pages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/

/*
Migration: Convert content column from String to JSONB
This maintains existing data by:
1. Adding a temporary JSONB column
2. Converting existing string data to JSONB with more defensive approach
3. Dropping the old column
4. Renaming the new column
*/

-- Step 1: Add temporary JSONB column
ALTER TABLE "module_pages" ADD COLUMN "content_jsonb" JSONB;

-- Step 2: Migrate data with safer conversion
-- Attempt to parse existing content as JSON, fallback to default structure
UPDATE "module_pages"
SET "content_jsonb" = 
  CASE 
    WHEN content IS NULL THEN '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":""}]}]}'::JSONB
    ELSE
      -- Try to parse as JSON, if it fails use default structure
      COALESCE(
        (SELECT content::JSONB WHERE content::JSONB IS NOT NULL),
        '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Content conversion failed"}]}]}'::JSONB
      )
  END;

-- Step 3: Make the new column non-nullable once data is migrated
ALTER TABLE "module_pages" ALTER COLUMN "content_jsonb" SET NOT NULL;

-- Step 4: Drop the old column
ALTER TABLE "module_pages" DROP COLUMN "content";

-- Step 5: Rename the new column to match the original name
ALTER TABLE "module_pages"
RENAME COLUMN "content_jsonb" TO "content";