-- AlterTable
ALTER TABLE "walk" ADD COLUMN     "address_id" INTEGER,
ADD COLUMN     "notes" TEXT;

-- AddForeignKey
ALTER TABLE "walk" ADD CONSTRAINT "walk_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
