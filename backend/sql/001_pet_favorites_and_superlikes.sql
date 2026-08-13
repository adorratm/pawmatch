-- Favoriler tablosu (PetFavorite). synchronize kapalı olduğu için manuel çalıştırın.
CREATE TABLE IF NOT EXISTS pet_favorites (
  id SERIAL PRIMARY KEY,
  "userId" integer NOT NULL,
  "petId" integer NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_pet_favorites_user_pet" UNIQUE ("userId", "petId"),
  CONSTRAINT "FK_pet_favorites_user" FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT "FK_pet_favorites_pet" FOREIGN KEY ("petId") REFERENCES pets(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IDX_pet_favorites_userId" ON pet_favorites ("userId");

-- Süper beğeni işareti (MatchLike)
ALTER TABLE match_likes
  ADD COLUMN IF NOT EXISTS "isSuperLike" boolean NOT NULL DEFAULT false;
