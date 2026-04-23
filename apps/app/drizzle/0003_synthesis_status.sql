ALTER TABLE "dibs" ADD COLUMN "synthesis_status" text DEFAULT 'pending' CHECK ("synthesis_status" IN ('pending', 'success', 'failed'));
ALTER TABLE "dibs" ADD COLUMN "synthesis_error" text;
ALTER TABLE "dibs" ADD COLUMN "synthesis_retry_count" integer DEFAULT 0;
