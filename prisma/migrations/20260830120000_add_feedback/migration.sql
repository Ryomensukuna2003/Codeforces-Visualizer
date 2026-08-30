-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rating" INTEGER,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "Feedback_category_idx" ON "Feedback"("category");
