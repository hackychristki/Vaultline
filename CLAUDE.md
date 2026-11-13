# Vaultline – Projektkontext für Claude Code

Sicheres Multi-Währungs-Portfolio-Dashboard: eine Web-App, in der man ein fiktives
Wertschriften-Depot verwaltet. Portfolio- und Bewerbungsprojekt (Ziel: IT-Praktikum,
u. a. bei einer Bank), daher liegt der Fokus auf Sicherheit und sauberer Architektur.

Repo: https://github.com/hackychristki/Vaultline

## Zusammenarbeit

- Das Projekt wird **Schritt für Schritt** aufgebaut. Immer nur einen Schritt umsetzen,
  dann warten, bis der Benutzer "nächster Schritt" sagt.
- Erklärungen, Code-Kommentare und Commit-Beschreibungen auf **Deutsch** (Schweizer
  Schreibweise: "ss" statt "ß"). Bei jedem Schritt kurz das **Warum** erklären,
  besonders bei Sicherheitsentscheiden. Der Benutzer muss das Projekt später
  vor Lehrern bzw. in Bewerbungsgesprächen erklären können.
- Der Benutzer kennt Java/C# gut. Vergleiche mit Java/C# helfen.
- Pro Schritt: Testbefehle mit `curl` (Git Bash unter Windows) und einen Commit-Vorschlag
  (`feat: …`, `chore: …`) mitliefern.

## Stack

- Node.js **≥ 22** (nutzt `--env-file-if-exists`, `--watch`, `import.meta.dirname`)
- Express **5** (async-Fehler landen automatisch im errorHandler, kein try/catch nötig)
- SQLite über `better-sqlite3` (synchron), eigenes Migrationssystem
- `helmet`, `argon2` (Argon2id), `zod`, `express-session`
- Kein `dotenv`, kein `nodemon`: Node erledigt beides selbst

## Befehle

```bash
npm i
cp .env.example .env      # danach SESSION_SECRET setzen (siehe unten)
npm run dev               # node --watch --env-file-if-exists=.env src/server.js
npm start
```

Secret erzeugen:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Struktur

```
src/
  server.js              Startpunkt: Migrationen, listen, Graceful Shutdown (SIGINT/SIGTERM, DB schliessen)
  app.js                 baut die Express-App (ohne listen → testbar)
  config/index.js        einzige Stelle, die process.env liest; prüft Werte beim Start
  db/
    database.js          eine DB-Verbindung, WAL, foreign_keys = ON
    migrate.js           führt neue .sql-Dateien in migrations/ aus (Tabelle schema_migrations)
    session-store.js     eigener express-session-Store in SQLite
    migrations/          001_init.sql, 002_sessions.sql
  routes/                nur URL → Middleware → Controller
  controllers/           req/res, keine Geschäftslogik
  services/              Geschäftslogik, wirft HttpError
  models/                Datenzugriff (SQL)
  middleware/            error, validate, auth (requireAuth)
  validators/            Zod-Schemas
  utils/                 http-error.js, password.js, session.js
public/                  Frontend (noch leer)
tests/                   (noch leer)
```

## Konventionen (wichtig)

- **ES-Module** (`"type": "module"`): relative Imports immer mit vollem Pfad und `.js`,
  z. B. `'../config/index.js'`. Ordner-Imports funktionieren nicht.
- Schichten strikt trennen: Routes → Controllers → Services → Models.
- Fehler: `throw new HttpError(status, message, details?)`. **Reihenfolge: Status zuerst.**
  Der errorHandler akzeptiert nur Status 400–599, sonst 500. In Produktion gibt er keine
  Details zu 500er-Fehlern heraus.
- Validierung: `validate(zodSchema)` als Middleware vor dem Controller. Zod entfernt
  unbekannte Felder (Schutz gegen Mass Assignment, z. B. `role` bei der Registrierung).
- SQL nur mit Platzhaltern (`?`, `@name`). Statements **innerhalb** der Funktionen
  vorbereiten, nicht beim Import (Tabellen existieren erst nach den Migrationen).
- Schemaänderungen nur über eine neue Migration `NNN_name.sql`, nie bestehende ändern.
- **Geld als Ganzzahl** in der kleinsten Einheit (`price_minor`, Rappen/Cents), nie Float.
- Zeiten in der DB in UTC (`datetime('now')`), Sessions in Unix-Millisekunden.
- `password_hash` und `totp_secret_enc` dürfen nie in einer API-Antwort landen
  → immer `userModel.toPublic(user)` verwenden.
- Neue Umgebungsvariablen: in `.env` (echter Wert) **und** `.env.example` (leerer Platzhalter),
  und in `config/index.js` prüfen.

## Datenbank (001_init.sql)

- `users`: id, username (UNIQUE, COLLATE NOCASE), password_hash, role ('kunde'|'berater'),
  totp_secret_enc, totp_enabled, created_at
- `advisor_clients`: advisor_id, client_id (n:m Berater ↔ Kunden)
- `portfolios`: id, owner_id, name, base_currency ('CHF'|'EUR'|'USD')
- `positions`: id, portfolio_id, symbol, name, quantity (>0), price_minor (≥0), currency
- `audit_log`: id, user_id (ON DELETE SET NULL), username (Kopie), action, resource,
  success, ip, details (JSON), created_at
- `sessions` (002): sid, data (JSON), expires_at

## API bisher

| Methode | Pfad | Schutz | Beschreibung |
|---|---|---|---|
| GET | /api/health | – | Status, Uptime |
| POST | /api/auth/register | Zod | erzeugt immer Rolle `kunde` (201, 409 bei Duplikat) |
| POST | /api/auth/login | Zod | 401 mit gleicher Meldung für unbekannten Benutzer und falsches Passwort |
| POST | /api/auth/logout | requireAuth | Session löschen und Cookie entfernen (204) |
| GET | /api/auth/me | requireAuth | aktueller Benutzer |

## Umgesetzte Sicherheitsmassnahmen

- helmet-Header, `x-powered-by` aus, JSON-Body-Limit 10 kb
- Argon2id (OWASP-Parameter: 19 MiB, t=2, p=1), Passwort 12–128 Zeichen
- Login: Dummy-Hash bei unbekanntem Benutzer (gegen Timing-basierte User Enumeration),
  einheitliche Fehlermeldung
- Sessions serverseitig in SQLite statt JWT (sofortiger Widerruf möglich);
  `regenerate()` nach dem Login (gegen Session Fixation); Cookie `vaultline.sid` mit
  httpOnly, SameSite=strict, secure in Produktion; 30 Min. Inaktivitäts-Timeout (rolling)
- App startet nicht ohne `SESSION_SECRET` (≥ 32 Zeichen)

## Stand und Roadmap

| # | Schritt | Status |
|---|---|---|
| 1 | Grundgerüst (npm, Git, Ordner, .gitignore) | ✅ |
| 2 | Express, Config, Health-Check, Error-Handling | ✅ |
| 3 | SQLite, Schema, Migrationen | ✅ |
| 4 | Registrierung (Argon2, Zod) | ✅ |
| 5 | Login/Logout, Sessions in SQLite | ⏳ Code geliefert, Tests vom Benutzer noch nicht bestätigt |
| 6 | Verschlüsselung sensibler Felder (AES-256-GCM, Key aus .env) | offen, **als Nächstes** |
| 7 | 2FA mit TOTP (QR-Code, Secret verschlüsselt speichern). `userId` erst nach gültigem Code in die Session setzen, davor nur einen "pending"-Zustand | offen |
| 8 | Rollen/Autorisierung: Kunde nur eigenes Depot, Berater nur zugewiesene Kunden | offen |
| 9 | Depots und Positionen (CRUD mit Zugriffsprüfung) | offen |
| 10 | Wechselkurse über eine freie API, Caching, Umrechnung CHF/EUR/USD | offen |
| 11 | Audit-Log-Middleware und Ansicht (Bezug auf das frühere Projekt "API Pulse") | offen |
| 12 | Frontend (Login, 2FA, Dashboard) in `public/` | offen |
| 13 | Härtung: Rate Limiting (Login), CSRF, Seed-Daten (Berater + Testkunden) | offen |
| 14 | Tests (Unit + API, In-Memory-SQLite) | offen |
| 15 | Docker (Dockerfile, compose, Volume für data/) und README | offen |

## Bekannte Stolpersteine

- Entwicklung unter Windows mit Git Bash (`C:\Temp_local\Vaultline`), zum Teil auf mehreren Rechnern.
  `.env` und `data/` sind gitignored: Auf einem neuen Rechner `.env` neu anlegen,
  die DB startet dort leer.
- Beim Einrichten von Dateien in VS Code (Compact Folders) landeten schon Dateien im
  falschen Ordner. Bei `ERR_MODULE_NOT_FOUND` zuerst die Ablage prüfen.
