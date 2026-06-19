-- CreateEnum
CREATE TYPE "NotificationMode" AS ENUM ('PER_SUBSCRIPTION', 'DIGEST');

-- CreateEnum
CREATE TYPE "DigestFrequency" AS ENUM ('WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notifyEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifyMode" "NotificationMode" NOT NULL DEFAULT 'PER_SUBSCRIPTION',
ADD COLUMN     "notifyDaysBefore" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "notifyDigestFrequency" "DigestFrequency" NOT NULL DEFAULT 'WEEKLY',
ADD COLUMN     "lastDigestSentAt" TIMESTAMP(3),
ADD COLUMN     "resetTokenHash" TEXT,
ADD COLUMN     "resetTokenExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "reminderSentForDate" TIMESTAMP(3);
