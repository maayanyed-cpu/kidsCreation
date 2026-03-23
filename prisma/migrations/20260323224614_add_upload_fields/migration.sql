-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ArtworkAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artwork_id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "thumb_url" TEXT,
    "title" TEXT,
    "status" TEXT NOT NULL DEFAULT 'analyzed',
    "analysis_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "predominant_colors" TEXT NOT NULL,
    "main_subjects" TEXT NOT NULL,
    "technique_notes" TEXT NOT NULL,
    "ai_tags" TEXT NOT NULL,
    "emotional_tone" TEXT NOT NULL DEFAULT 'Joyful',
    "deleted_at" DATETIME
);
INSERT INTO "new_ArtworkAnalysis" ("ai_tags", "analysis_date", "artwork_id", "child_id", "emotional_tone", "id", "image_url", "main_subjects", "predominant_colors", "technique_notes") SELECT "ai_tags", "analysis_date", "artwork_id", "child_id", "emotional_tone", "id", "image_url", "main_subjects", "predominant_colors", "technique_notes" FROM "ArtworkAnalysis";
DROP TABLE "ArtworkAnalysis";
ALTER TABLE "new_ArtworkAnalysis" RENAME TO "ArtworkAnalysis";
CREATE UNIQUE INDEX "ArtworkAnalysis_artwork_id_key" ON "ArtworkAnalysis"("artwork_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
