-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "email" VARCHAR(255),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "clients_email_idx" ON "clients"("email");
