-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "twitterUsername" TEXT;

-- CreateIndex
CREATE INDEX "Contact_twitterUsername_idx" ON "Contact"("twitterUsername");
