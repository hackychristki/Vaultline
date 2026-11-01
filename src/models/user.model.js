import { db } from '../db/database.js';


export function findById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function findByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

export function create({ username, passwordHash, role }) {
  const result = db
    .prepare(`
      INSERT INTO users (username, password_hash, role)
      VALUES (@username, @passwordHash, @role)
    `)
    .run({ username, passwordHash, role });

  return findById(result.lastInsertRowid);
}

// Nur unkritische Felder nach aussen geben.
// password_hash und totp_secret_enc dürfen NIE in einer Antwort landen.
export function toPublic(user) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.created_at,
  };
}