-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "dueTime" TIMESTAMP(3),
ADD COLUMN     "estimatedDuration" INTEGER;

-- CreateIndex
CREATE INDEX "Task_dueTime_idx" ON "Task"("dueTime");
