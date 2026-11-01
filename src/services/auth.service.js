import * as userModel from '../models/user.model.js';
import { hashPassword } from '../utils/password.js';
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