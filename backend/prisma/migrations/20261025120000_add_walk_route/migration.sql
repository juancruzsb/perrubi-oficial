-- AlterTable
ALTER TABLE "walk" ADD COLUMN "approach_polyline" TEXT,
ADD COLUMN "approach_distance_meters" INTEGER,
ADD COLUMN "approach_duration" TEXT;

-- CreateTable
CREATE TABLE "walk_location_point" (
    "id" SERIAL NOT NULL,
    "walk_id" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "phase" TEXT NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "walk_location_point_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "walk_location_point_walk_id_recorded_at_idx" ON "walk_location_point"("walk_id", "recorded_at");

-- AddForeignKey
ALTER TABLE "walk_location_point" ADD CONSTRAINT "walk_location_point_walk_id_fkey" FOREIGN KEY ("walk_id") REFERENCES "walk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
