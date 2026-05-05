-- CreateTable
CREATE TABLE "game_results" (
    "id" UUID NOT NULL,
    "friend_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "grab_index" INTEGER NOT NULL,
    "gift_snapshot" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_results_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "game_results" ADD CONSTRAINT "game_results_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "friends"("id") ON DELETE CASCADE ON UPDATE CASCADE;
