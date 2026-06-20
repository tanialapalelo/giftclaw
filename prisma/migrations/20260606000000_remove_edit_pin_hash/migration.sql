-- Remove unused editPinHash column that was never implemented
ALTER TABLE "friends" DROP COLUMN IF EXISTS "edit_pin_hash";
