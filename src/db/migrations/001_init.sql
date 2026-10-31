-- Benutzer: Kunden und Berater
CREATE TABLE users (
  id              INTEGER PRIMARY KEY,
  username        TEXT    NOT NULL UNIQUE COLLATE NOCASE, -- "Chris" = "chris"
  password_hash   TEXT    NOT NULL,                       -- nie das Klartext-Passwort!
  role            TEXT    NOT NULL CHECK (role IN ('kunde', 'berater')),
  totp_secret_enc TEXT,                                   -- 2FA-Secret, verschlüsselt
  totp_enabled    INTEGER NOT NULL DEFAULT 0 CHECK (totp_enabled IN (0, 1)),
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Welcher Berater betreut welche Kunden (n:m-Beziehung)
CREATE TABLE advisor_clients (
  advisor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (advisor_id, client_id)
);

-- Depots: gehören genau einem Kunden
CREATE TABLE portfolios (
  id            INTEGER PRIMARY KEY,
  owner_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT    NOT NULL,
  base_currency TEXT    NOT NULL DEFAULT 'CHF' CHECK (base_currency IN ('CHF', 'EUR', 'USD')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Positionen im Depot
CREATE TABLE positions (
  id           INTEGER PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol       TEXT    NOT NULL,                   -- z. B. 'NESN'
  name         TEXT    NOT NULL,                   -- z. B. 'Nestlé'
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  price_minor  INTEGER NOT NULL CHECK (price_minor >= 0), -- Preis in Rappen/Cents
  currency     TEXT    NOT NULL CHECK (currency IN ('CHF', 'EUR', 'USD')),
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_positions_portfolio ON positions(portfolio_id);

-- Audit-Log: wer hat wann was getan
CREATE TABLE audit_log (
  id         INTEGER PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  username   TEXT,              -- Kopie, damit der Eintrag auch nach Löschung lesbar bleibt
  action     TEXT    NOT NULL,  -- z. B. 'LOGIN', 'VIEW_PORTFOLIO'
  resource   TEXT,              -- z. B. 'portfolio:3'
  success    INTEGER NOT NULL CHECK (success IN (0, 1)),
  ip         TEXT,
  details    TEXT,              -- optionales JSON
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_audit_user    ON audit_log(user_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);