-- AlterTable
ALTER TABLE "public"."Event" ALTER COLUMN "images" SET DEFAULT '[]';

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "profileImage" SET DEFAULT '{}';
