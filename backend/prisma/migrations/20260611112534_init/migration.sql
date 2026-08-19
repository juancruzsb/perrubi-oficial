-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "review" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Walker" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "review" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Walker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dog" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Dog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Walk" (
    "id" SERIAL NOT NULL,
    "walkerId" INTEGER NOT NULL,
    "dogId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Walk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Walker_email_key" ON "Walker"("email");

-- AddForeignKey
ALTER TABLE "Dog" ADD CONSTRAINT "Dog_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Walk" ADD CONSTRAINT "Walk_walkerId_fkey" FOREIGN KEY ("walkerId") REFERENCES "Walker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Walk" ADD CONSTRAINT "Walk_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
