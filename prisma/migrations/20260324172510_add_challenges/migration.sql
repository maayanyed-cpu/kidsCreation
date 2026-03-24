-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "title_he" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "description_he" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "week_start" DATETIME NOT NULL,
    "week_end" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChallengeSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challenge_id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "artwork_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChallengeSubmission_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeSubmission_challenge_id_child_id_key" ON "ChallengeSubmission"("challenge_id", "child_id");
