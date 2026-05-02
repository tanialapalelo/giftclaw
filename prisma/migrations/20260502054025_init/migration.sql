-- CreateTable
CREATE TABLE "friends" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "interests" TEXT[],
    "hobbies" TEXT[],
    "dislikes" TEXT[],
    "budget_min" INTEGER,
    "budget_max" INTEGER,
    "notes" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'soft',
    "edit_pin_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_suggestions" (
    "id" UUID NOT NULL,
    "friend_id" UUID NOT NULL,
    "suggestions" JSONB NOT NULL,
    "model_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gift_suggestions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "gift_suggestions" ADD CONSTRAINT "gift_suggestions_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "friends"("id") ON DELETE CASCADE ON UPDATE CASCADE;
