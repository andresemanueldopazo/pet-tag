-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "tagCode" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Pet_tagCode_fkey" FOREIGN KEY ("tagCode") REFERENCES "Tag" ("code") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Pet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_code_key" ON "Tag"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Pet_tagCode_key" ON "Pet"("tagCode");

-- CreateIndex
CREATE UNIQUE INDEX "Pet_name_ownerId_key" ON "Pet"("name", "ownerId");
