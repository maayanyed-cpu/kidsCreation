/*
  Warnings:

  - A unique constraint covering the columns `[share_code]` on the table `Child` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Child" ADD COLUMN "share_code" TEXT;

-- CreateTable
CREATE TABLE "Follower" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "follower_id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_notified_at" DATETIME,
    CONSTRAINT "Follow_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "Follower" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Follow_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artwork_id" TEXT NOT NULL,
    "user_type" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artwork_id" TEXT NOT NULL,
    "user_type" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "Follower_email_key" ON "Follower"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_follower_id_child_id_key" ON "Follow"("follower_id", "child_id");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_artwork_id_user_type_user_id_key" ON "Reaction"("artwork_id", "user_type", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Child_share_code_key" ON "Child"("share_code");
