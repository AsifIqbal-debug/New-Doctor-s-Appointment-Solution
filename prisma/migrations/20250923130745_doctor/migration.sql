-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('PATIENT', 'DOCTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."AppointmentStatus" AS ENUM ('BOOKED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Doctor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialty" TEXT,
    "bio" TEXT,
    "roomNo" TEXT,
    "defaultSlotMinutes" INTEGER NOT NULL DEFAULT 15,
    "priceRuleSetId" TEXT,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Patient" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "gender" TEXT,
    "notes" TEXT,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DoctorAvailability" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DoctorAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DoctorDayOff" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "DoctorDayOff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Appointment" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."AppointmentStatus" NOT NULL DEFAULT 'BOOKED',
    "feeBdt" INTEGER NOT NULL,
    "feeRule" TEXT NOT NULL,
    "paidAmountBdt" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Visit" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vitalsJson" JSONB,
    "notes" TEXT,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Prescription" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "itemsJson" JSONB NOT NULL,
    "advice" TEXT,
    "attachmentUrl" TEXT,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TestOrder" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "notes" TEXT,
    "uploadedResultUrl" TEXT,
    "uploadedByAdminId" TEXT,
    "uploadedAt" TIMESTAMP(3),

    CONSTRAINT "TestOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "amountBdt" INTEGER NOT NULL,
    "receivedByAdminId" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PriceRuleSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "rulesJson" JSONB NOT NULL,

    CONSTRAINT "PriceRuleSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_userId_key" ON "public"."Doctor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_userId_key" ON "public"."Patient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorDayOff_doctorId_date_key" ON "public"."DoctorDayOff"("doctorId", "date");

-- CreateIndex
CREATE INDEX "Appointment_doctorId_startsAt_idx" ON "public"."Appointment"("doctorId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_doctorId_startsAt_key" ON "public"."Appointment"("doctorId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Visit_appointmentId_key" ON "public"."Visit"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_appointmentId_key" ON "public"."Prescription"("appointmentId");

-- CreateIndex
CREATE INDEX "TestOrder_appointmentId_idx" ON "public"."TestOrder"("appointmentId");

-- AddForeignKey
ALTER TABLE "public"."Doctor" ADD CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Doctor" ADD CONSTRAINT "Doctor_priceRuleSetId_fkey" FOREIGN KEY ("priceRuleSetId") REFERENCES "public"."PriceRuleSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoctorAvailability" ADD CONSTRAINT "DoctorAvailability_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoctorDayOff" ADD CONSTRAINT "DoctorDayOff_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Visit" ADD CONSTRAINT "Visit_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TestOrder" ADD CONSTRAINT "TestOrder_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
