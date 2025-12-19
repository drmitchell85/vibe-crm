/*
  Warnings:

  - You are about to drop the column `twitterUsername` on the `Contact` table. All the data in the column will be lost.

*/
-- Step 1: Add the new socialMedia column
ALTER TABLE "Contact" ADD COLUMN "socialMedia" JSONB;

-- Step 2: Migrate existing twitterUsername data to socialMedia JSON format
-- This creates a JSON object like: { "twitter": "@username" }
UPDATE "Contact"
SET "socialMedia" = jsonb_build_object('twitter', "twitterUsername")
WHERE "twitterUsername" IS NOT NULL;

-- Step 3: Drop the old index
DROP INDEX "Contact_twitterUsername_idx";

-- Step 4: Drop the old column
ALTER TABLE "Contact" DROP COLUMN "twitterUsername";
