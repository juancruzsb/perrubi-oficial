-- CreateTable
CREATE TABLE "chat" (
    "id" SERIAL NOT NULL,
    "walk_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message" (
    "id" SERIAL NOT NULL,
    "chat_id" INTEGER NOT NULL,
    "sender_type" TEXT NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_walk_id_key" ON "chat"("walk_id");

-- CreateIndex
CREATE INDEX "chat_message_chat_id_created_at_idx" ON "chat_message"("chat_id", "created_at");

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_walk_id_fkey" FOREIGN KEY ("walk_id") REFERENCES "walk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
