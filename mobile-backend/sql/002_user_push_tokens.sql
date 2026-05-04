CREATE TABLE IF NOT EXISTS user_push_tokens (
  id SERIAL PRIMARY KEY,
  "userId" integer NOT NULL,
  token text NOT NULL,
  platform character varying(16) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_user_push_tokens_token" UNIQUE (token),
  CONSTRAINT "FK_user_push_tokens_user" FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IDX_user_push_tokens_userId" ON user_push_tokens ("userId");
