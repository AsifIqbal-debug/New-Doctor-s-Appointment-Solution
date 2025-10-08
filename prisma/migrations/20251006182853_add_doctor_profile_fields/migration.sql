-- AlterTable
ALTER TABLE "public"."Doctor" ADD COLUMN     "experienceYears" INTEGER,
ADD COLUMN     "feeBdt" INTEGER NOT NULL DEFAULT 500,
ADD COLUMN     "qualification" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
