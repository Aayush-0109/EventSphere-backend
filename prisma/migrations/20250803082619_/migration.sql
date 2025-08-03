-- AlterTable
ALTER TABLE "public"."organizerRequest" ADD COLUMN     "overview" TEXT,
ADD COLUMN     "resume" JSONB;

-- AddForeignKey
ALTER TABLE "public"."organizerRequest" ADD CONSTRAINT "organizerRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
