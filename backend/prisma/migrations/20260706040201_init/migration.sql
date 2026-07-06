/*
  Warnings:

  - You are about to drop the `Dog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Walk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Walker` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Dog" DROP CONSTRAINT "Dog_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Walk" DROP CONSTRAINT "Walk_dogId_fkey";

-- DropForeignKey
ALTER TABLE "Walk" DROP CONSTRAINT "Walk_walkerId_fkey";

-- DropTable
DROP TABLE "Dog";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "Walk";

-- DropTable
DROP TABLE "Walker";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT,
    "phone" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dog" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "breed" TEXT,
    "gender" TEXT,
    "weight" DECIMAL(65,30),
    "extra_notes" TEXT,
    "photo" TEXT,
    "review" TEXT,

    CONSTRAINT "dog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_dog" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "dog_id" INTEGER NOT NULL,

    CONSTRAINT "user_dog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "walker" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "average_rating" DECIMAL(65,30),
    "review_count" INTEGER,
    "role" TEXT,
    "profile_picture" TEXT,
    "description" TEXT,

    CONSTRAINT "walker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "walk" (
    "id" SERIAL NOT NULL,
    "walker_id" INTEGER NOT NULL,
    "walk_type" TEXT,
    "status" TEXT,
    "price" DECIMAL(65,30),
    "start_time" TIMESTAMP(3),
    "duration" INTEGER,
    "end_time" TIMESTAMP(3),

    CONSTRAINT "walk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "walk_dog" (
    "id" SERIAL NOT NULL,
    "walk_id" INTEGER NOT NULL,
    "dog_id" INTEGER NOT NULL,

    CONSTRAINT "walk_dog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "walk_user" (
    "id" SERIAL NOT NULL,
    "walk_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "walk_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "label" TEXT,
    "street" TEXT,
    "number" TEXT,
    "floor_apt" TEXT,
    "city" TEXT,
    "zip_code" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "walker_email_key" ON "walker"("email");

-- AddForeignKey
ALTER TABLE "user_dog" ADD CONSTRAINT "user_dog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_dog" ADD CONSTRAINT "user_dog_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "walk" ADD CONSTRAINT "walk_walker_id_fkey" FOREIGN KEY ("walker_id") REFERENCES "walker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "walk_dog" ADD CONSTRAINT "walk_dog_walk_id_fkey" FOREIGN KEY ("walk_id") REFERENCES "walk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "walk_dog" ADD CONSTRAINT "walk_dog_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "walk_user" ADD CONSTRAINT "walk_user_walk_id_fkey" FOREIGN KEY ("walk_id") REFERENCES "walk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "walk_user" ADD CONSTRAINT "walk_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
