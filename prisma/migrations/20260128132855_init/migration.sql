-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "logo" TEXT,
    "crawlInterval" INTEGER NOT NULL DEFAULT 360,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastCrawledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "viewCount" INTEGER DEFAULT 0,
    "commentCount" INTEGER DEFAULT 0,
    "likeCount" INTEGER DEFAULT 0,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Post_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Site_name_key" ON "Site"("name");

-- CreateIndex
CREATE INDEX "Site_name_idx" ON "Site"("name");

-- CreateIndex
CREATE INDEX "Site_isActive_idx" ON "Site"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Post_url_key" ON "Post"("url");

-- CreateIndex
CREATE INDEX "Post_siteId_idx" ON "Post"("siteId");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "Post_fetchedAt_idx" ON "Post"("fetchedAt");

-- CreateIndex
CREATE INDEX "Post_url_idx" ON "Post"("url");
