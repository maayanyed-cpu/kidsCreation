-- CreateTable
CREATE TABLE "Insights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "child_id" TEXT NOT NULL,
    "analysis_period" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "milestone_detected" TEXT NOT NULL,
    "top_interest" TEXT NOT NULL,
    "growth_tip" TEXT NOT NULL,
    "encouragement_scripts" TEXT NOT NULL,
    "visual_evolution" JSONB NOT NULL,
    "thematic_focus" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ArtworkAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artwork_id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "analysis_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "predominant_colors" TEXT NOT NULL,
    "main_subjects" TEXT NOT NULL,
    "technique_notes" TEXT NOT NULL,
    "ai_tags" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Insights_child_id_analysis_period_key" ON "Insights"("child_id", "analysis_period");

-- CreateIndex
CREATE UNIQUE INDEX "ArtworkAnalysis_artwork_id_key" ON "ArtworkAnalysis"("artwork_id");
