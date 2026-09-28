-- CreateTable
CREATE TABLE "SubjectFile" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubjectFile_subjectId_idx" ON "SubjectFile"("subjectId");

-- AddForeignKey
ALTER TABLE "SubjectFile" ADD CONSTRAINT "SubjectFile_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
