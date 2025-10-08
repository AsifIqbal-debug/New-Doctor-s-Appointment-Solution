-- AlterTable
ALTER TABLE "public"."Doctor" ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "public"."BoardCard" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "icon" TEXT,
    "link" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoardCard_pkey" PRIMARY KEY ("id")
);
