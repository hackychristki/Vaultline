-- Speicher für Login-Sessions
CREATE TABLE sessions (
  sid        TEXT    PRIMARY KEY,  -- Session-ID (steht im Cookie)
  data       TEXT    NOT NULL,     -- Session-Inhalt als JSON
  expires_at INTEGER NOT NULL      -- Ablaufzeit als Unix-Zeit in Millisekunden
);

-- Damit das Löschen abgelaufener Sessions schnell geht
CREATE INDEX idx_sessions_expires ON sessions(expires_at);