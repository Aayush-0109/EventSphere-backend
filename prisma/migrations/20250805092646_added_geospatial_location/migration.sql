/*
  Warnings:

  - You are about to drop the column `location` on the `Event` table. All the data in the column will be lost.
  - Added the required column `address` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Event" DROP COLUMN "location",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "postalCode" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "location_idx" ON "public"."Event"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "city_idx" ON "public"."Event"("city");

-- CreateIndex
CREATE INDEX "state_idx" ON "public"."Event"("state");

-- CreateIndex
CREATE INDEX "postalCode_idx" ON "public"."Event"("postalCode");
