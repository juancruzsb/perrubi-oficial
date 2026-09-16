-- CreateTable
CREATE TABLE "walk_location" (
    "id" SERIAL NOT NULL,
    "walk_id" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "walk_location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "walk_location_walk_id_key" ON "walk_location"("walk_id");

-- AddForeignKey
ALTER TABLE "walk_location" ADD CONSTRAINT "walk_location_walk_id_fkey" FOREIGN KEY ("walk_id") REFERENCES "walk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
