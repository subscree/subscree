-- Team-aware reminders: dedupe per (user, subscription, billing occurrence) so
-- every team member who enabled reminders is notified, each exactly once.

-- The old single-recipient dedupe field is replaced by ReminderLog.
ALTER TABLE "Subscription" DROP COLUMN "reminderSentForDate";

-- CreateTable
CREATE TABLE "ReminderLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "billingDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReminderLog_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ReminderLog_userId_subscriptionId_billingDate_key" ON "ReminderLog"("userId", "subscriptionId", "billingDate");
CREATE INDEX "ReminderLog_subscriptionId_idx" ON "ReminderLog"("subscriptionId");

-- AddForeignKey
ALTER TABLE "ReminderLog" ADD CONSTRAINT "ReminderLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReminderLog" ADD CONSTRAINT "ReminderLog_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
