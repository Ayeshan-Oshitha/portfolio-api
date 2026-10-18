BEGIN;

CREATE TYPE "ApprovalStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED'
);

ALTER TABLE "user"
  ALTER COLUMN "approvalStatus" DROP DEFAULT;

ALTER TABLE "user"
  ALTER COLUMN "approvalStatus"
  TYPE "ApprovalStatus"
  USING ("approvalStatus"::"ApprovalStatus");

ALTER TABLE "user"
  ALTER COLUMN "approvalStatus" SET DEFAULT 'PENDING';

COMMIT;
