/*
  Warnings:

  - The `images` column on the `Event` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `profileImage` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."registration" DROP CONSTRAINT "registration_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."registration" DROP CONSTRAINT "registration_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Event" DROP COLUMN "images",
ADD COLUMN     "images" JSONB;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "profileImage",
ADD COLUMN     "profileImage" JSONB;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registration" ADD CONSTRAINT "registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registration" ADD CONSTRAINT "registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
