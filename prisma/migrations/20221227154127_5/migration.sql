/*
  Warnings:

  - You are about to drop the column `email` on the `Parent` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Parent` table. All the data in the column will be lost.
  - You are about to drop the column `visible` on the `Parent` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Phone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "parentId" INTEGER NOT NULL,
    CONSTRAINT "Phone_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Email" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "address" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "parentId" INTEGER NOT NULL,
    CONSTRAINT "Email_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Parent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "petId" INTEGER NOT NULL,
    CONSTRAINT "Parent_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Parent" ("id", "name", "petId") SELECT "id", "name", "petId" FROM "Parent";
DROP TABLE "Parent";
ALTER TABLE "new_Parent" RENAME TO "Parent";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Phone_parentId_key" ON "Phone"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Email_parentId_key" ON "Email"("parentId");
