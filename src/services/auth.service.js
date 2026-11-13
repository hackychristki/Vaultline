import * as userModel from '../models/user.model.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { HttpError } from '../utils/http-error.js';

export async function register({ username, password }) {
  const passwordHash = await hashPassword(password);

  try {
    // Selbstregistrierung erzeugt IMMER einen Kunden.
    // Berater werden nur intern angelegt (später über Seed-Daten).
    const user = userModel.create({ username, passwordHash, role: 'kunde' });
    return userModel.toPublic(user);
  } catch (err) {
    // Die UNIQUE-Constraint der DB erkennt doppelte Namen zuverlässig,
    // auch wenn zwei Registrierungen gleichzeitig ankommen.
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new HttpError(409, 'Benutzername bereits vergeben');
    }
    throw err;
  }
}

// Ein Hash, gegen den geprüft wird, wenn der Benutzer gar nicht existiert.
// Sonst wäre die Antwort für unbekannte Namen viel schneller (kein Argon2)
// und ein Angreifer könnte über die Zeit herausfinden, welche Namen existieren.
// Wird einmal beim ersten Login erzeugt und dann wiederverwendet.
let dummyHashPromise;
function getDummyHash() {
  dummyHashPromise ??= hashPassword('vaultline-dummy-password');
  return dummyHashPromise;
}

// Gibt den Benutzer zurück, wenn Name und Passwort stimmen, sonst Fehler 401.
export async function login({ username, password }) {
  const user = userModel.findByUsername(username);

  const ok = await verifyPassword(user?.password_hash ?? (await getDummyHash()), password);

  // Gleiche Meldung für "Benutzer unbekannt" und "Passwort falsch"
  if (!user || !ok) {
    throw new HttpError(401, 'Benutzername oder Passwort falsch');
  }

  return userModel.toPublic(user);
}

export function getCurrentUser(userId) {
  const user = userModel.findById(userId);
  return user ? userModel.toPublic(user) : null;
}
