-- CreateTable
CREATE TABLE "Snapshot" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "capturedOn" DATE NOT NULL,
    "rating" INTEGER,
    "maxRating" INTEGER,
    "rank" TEXT,
    "maxRank" TEXT,
    "solved" INTEGER NOT NULL,
    "submissions" INTEGER NOT NULL,
    "acRate" DOUBLE PRECISION NOT NULL,
    "avgSolvedRating" INTEGER NOT NULL,
    "contests" INTEGER NOT NULL,
    "bestRank" INTEGER,
    "worstRank" INTEGER,
    "avgRatingChange" DOUBLE PRECISION NOT NULL,
    "bestRatingChange" INTEGER NOT NULL,
    "worstRatingChange" INTEGER NOT NULL,
    "accuracy" INTEGER NOT NULL,
    "range" INTEGER NOT NULL,
    "power" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,
    "durability" INTEGER NOT NULL,
    "potential" INTEGER,
    "tagCounts" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Snapshot_handle_capturedOn_key" ON "Snapshot"("handle", "capturedOn");

-- CreateIndex
CREATE INDEX "Snapshot_handle_capturedOn_idx" ON "Snapshot"("handle", "capturedOn");

-- CreateIndex
CREATE INDEX "Snapshot_capturedOn_idx" ON "Snapshot"("capturedOn");

-- CreateTable
CREATE TABLE "DailyMetric" (
    "day" DATE NOT NULL,
    "name" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyMetric_pkey" PRIMARY KEY ("day", "name")
);

-- CreateIndex
CREATE INDEX "DailyMetric_day_idx" ON "DailyMetric"("day");
