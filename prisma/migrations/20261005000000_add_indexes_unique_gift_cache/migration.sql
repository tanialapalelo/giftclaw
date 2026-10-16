-- Keep only the newest cached suggestion set per friend before enforcing uniqueness.
DELETE FROM "gift_suggestions" a
USING "gift_suggestions" b
WHERE a."friend_id" = b."friend_id"
  AND (a."created_at", a."id") < (b."created_at", b."id");

-- CreateIndex
CREATE UNIQUE INDEX "gift_suggestions_friend_id_key" ON "gift_suggestions"("friend_id");

-- CreateIndex
CREATE INDEX "gift_suggestions_friend_id_created_at_idx" ON "gift_suggestions"("friend_id", "created_at");

-- CreateIndex
CREATE INDEX "game_results_friend_id_created_at_idx" ON "game_results"("friend_id", "created_at");
