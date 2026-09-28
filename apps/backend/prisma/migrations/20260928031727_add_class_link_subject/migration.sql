-- AlterTable
ALTER TABLE "ClassLink" ADD COLUMN "subjectId" TEXT;

-- CreateIndex
CREATE INDEX "ClassLink_subjectId_idx" ON "ClassLink"("subjectId");

-- AddForeignKey
ALTER TABLE "ClassLink" ADD CONSTRAINT "ClassLink_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
