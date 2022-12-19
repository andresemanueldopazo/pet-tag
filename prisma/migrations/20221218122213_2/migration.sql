/*
  Warnings:

  - You are about to drop the column `tagCode` on the `Pet` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Tag` table. All the data in the column will be lost.
  - Added the required column `code` to the `Pet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tagPassword` to the `Pet` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagPassword" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Pet_tagPassword_fkey" FOREIGN KEY ("tagPassword") REFERENCES "Tag" ("password") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Pet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Pet" ("id", "name", "ownerId") SELECT "id", "name", "ownerId" FROM "Pet";
DROP TABLE "Pet";
ALTER TABLE "new_Pet" RENAME TO "Pet";
CREATE UNIQUE INDEX "Pet_code_key" ON "Pet"("code");
CREATE UNIQUE INDEX "Pet_tagPassword_key" ON "Pet"("tagPassword");
CREATE UNIQUE INDEX "Pet_name_ownerId_key" ON "Pet"("name", "ownerId");
CREATE TABLE "new_Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "password" TEXT NOT NULL
);
INSERT INTO "new_Tag" ("id", "password") SELECT "id", "password" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "new_Tag" RENAME TO "Tag";
CREATE UNIQUE INDEX "Tag_password_key" ON "Tag"("password");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
