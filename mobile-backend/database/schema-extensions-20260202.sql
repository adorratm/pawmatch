-- PawMatch: tasarım ekranları için ek tablolar (favoriler, klinik yorumları, destek).
-- synchronize kapalı olduğu için bir kez çalıştırın: psql veya admin aracıyla.

CREATE TABLE IF NOT EXISTS pet_favorites (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "petId" INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT uq_pet_favorites_user_pet UNIQUE ("userId", "petId")
);
CREATE INDEX IF NOT EXISTS idx_pet_favorites_user ON pet_favorites ("userId");

CREATE TABLE IF NOT EXISTS clinic_reviews (
  id SERIAL PRIMARY KEY,
  "clinicId" INTEGER NOT NULL REFERENCES veterinarian_clinics(id) ON DELETE CASCADE,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "overallRating" INTEGER NOT NULL,
  "cleanlinessRating" INTEGER NOT NULL,
  "serviceRating" INTEGER NOT NULL,
  "valueRating" INTEGER NOT NULL,
  comment TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_clinic_reviews_clinic ON clinic_reviews ("clinicId");

CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(32) DEFAULT 'open',
  "createdAt" TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets ("userId");
