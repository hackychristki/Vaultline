import session from 'express-session';
import { db } from './database.js';

// express-session speichert Sessions standardmässig im RAM ("MemoryStore").
// Der verliert bei jedem Neustart alles und ist laut Doku nicht für
// Produktion gedacht. Deshalb ein eigener Store, der in SQLite speichert.
//
// express-session ruft diese Methoden selbst auf, wir müssen nur die
// vorgegebene Schnittstelle (get, set, destroy, touch) umsetzen.
export class SqliteSessionStore extends session.Store {
  constructor({ ttlMs }) {
    super();
    this.ttlMs = ttlMs;

    // Alle 15 Minuten abgelaufene Sessions aufräumen.
    // unref(): Der Timer allein hält den Prozess nicht am Leben.
    this.cleanupTimer = setInterval(() => this.#cleanup(), 15 * 60 * 1000);
    this.cleanupTimer.unref();
  }

  // Ablaufzeitpunkt aus dem Cookie lesen, sonst TTL ab jetzt
  #expiresAt(sess) {
    const expires = sess.cookie?.expires;
    return expires ? new Date(expires).getTime() : Date.now() + this.ttlMs;
  }

  #cleanup() {
    db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
  }

  get(sid, callback) {
    try {
      const row = db
        .prepare('SELECT data, expires_at FROM sessions WHERE sid = ?')
        .get(sid);

      // Abgelaufene Sessions behandeln wie nicht vorhandene
      if (!row || row.expires_at <= Date.now()) return callback(null, null);

      callback(null, JSON.parse(row.data));
    } catch (err) {
      callback(err);
    }
  }

  set(sid, sess, callback) {
    try {
      // "Upsert": neu einfügen oder bestehende Session überschreiben
      db.prepare(`
        INSERT INTO sessions (sid, data, expires_at) VALUES (?, ?, ?)
        ON CONFLICT(sid) DO UPDATE SET
          data = excluded.data,
          expires_at = excluded.expires_at
      `).run(sid, JSON.stringify(sess), this.#expiresAt(sess));
      callback?.(null);
    } catch (err) {
      callback?.(err);
    }
  }

  destroy(sid, callback) {
    try {
      db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
      callback?.(null);
    } catch (err) {
      callback?.(err);
    }
  }

  // Wird bei jeder Anfrage aufgerufen: verlängert die Session (Inaktivitäts-Timeout)
  touch(sid, sess, callback) {
    try {
      db.prepare('UPDATE sessions SET expires_at = ? WHERE sid = ?')
        .run(this.#expiresAt(sess), sid);
      callback?.(null);
    } catch (err) {
      callback?.(err);
    }
  }
}