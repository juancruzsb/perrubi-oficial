-- DropForeignKey
ALTER TABLE "walk" DROP CONSTRAINT "walk_walker_id_fkey";

-- AlterTable
ALTER TABLE "walk" ALTER COLUMN "walker_id" DROP NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "walk" ADD CONSTRAINT "walk_walker_id_fkey" FOREIGN KEY ("walker_id") REFERENCES "walker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
