-- CreateTable
CREATE TABLE "ClassLink" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassLink_classId_idx" ON "ClassLink"("classId");

-- AddForeignKey
ALTER TABLE "ClassLink" ADD CONSTRAINT "ClassLink_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
