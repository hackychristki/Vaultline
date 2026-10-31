import fs from 'node:fs';
import path from 'node:path';
import { db } from './database.js';

// Ordner mit den SQL-Dateien, relativ zu dieser Datei
const migrationsDir = path.join(import.meta.dirname, 'migrations');

// Wendet alle noch nicht ausgeführten .sql-Dateien in alphabetischer
// Reihenfolge an (darum die Nummerierung 001_, 002_, …).
// So kann sich das Schema später ändern, ohne die DB neu zu erstellen.
export function runMigrations() {
  // Merkt sich, welche Migrationen schon gelaufen sind
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const applied = new Set(
    db.prepare('SELECT name FROM schema_migrations').pluck().all()
  );

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    // Transaktion: Entweder läuft die ganze Migration durch,
    // oder gar nichts wird geändert – nie ein halbes Schema.
    db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(file);
    })();

    console.log(`Migration angewendet: ${file}`);
  }
}