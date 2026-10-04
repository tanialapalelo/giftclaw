-- grab_index used to be sent by the client, so existing rows can hold
-- duplicates (two tabs each computing "grab 2") or out-of-range values.
-- Renumber every friend's grabs 1, 2, 3... in the order they were made.
-- For rows that were already correct this is a no-op.
UPDATE "game_results" AS gr
SET "grab_index" = numbered.rn
FROM (
    SELECT "id",
           ROW_NUMBER() OVER (PARTITION BY "friend_id" ORDER BY "created_at", "id") AS rn
    FROM "game_results"
) AS numbered
WHERE gr."id" = numbered."id"
  AND gr."grab_index" <> numbered.rn;

-- CreateIndex
CREATE UNIQUE INDEX "game_results_friend_id_grab_index_key" ON "game_results"("friend_id", "grab_index");

-- Prisma can't model CHECK constraints, so this one lives only in SQL.
-- It is added NOT VALID (enforced for every new or updated row) and then
-- validated only if no legacy row breaks it. A friend that collected more
-- than 3 grabs before the server-side cap existed would otherwise make this
-- migration fail; such rows are kept, not deleted, and the constraint can be
-- validated by hand once they are cleaned up.
ALTER TABLE "game_results"
    ADD CONSTRAINT "game_results_grab_index_range"
    CHECK ("grab_index" BETWEEN 1 AND 3) NOT VALID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM "game_results" WHERE "grab_index" NOT BETWEEN 1 AND 3
    ) THEN
        ALTER TABLE "game_results" VALIDATE CONSTRAINT "game_results_grab_index_range";
    END IF;
END $$;
