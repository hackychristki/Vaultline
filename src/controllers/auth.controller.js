import * as authService from '../services/auth.service.js';
import { HttpError } from '../utils/http-error.js';
import { SESSION_COOKIE_NAME, regenerateSession, destroySession } from '../utils/session.js';

// Kein try/catch nötig: Express 5 leitet Fehler aus async-Funktionen
// automatisch an den errorHandler weiter (Express 4 konnte das nicht).
export async function register(req, res) {
  const user = await authService.register(req.body);
  res.status(201).json(user);
}

export async function login(req, res) {
  const user = await authService.login(req.body);

  // Neue Session-ID nach dem Login: Schutz vor "Session Fixation".
  // Sonst könnte ein Angreifer dem Opfer vorher eine bekannte ID unterschieben
  // und wäre nach dessen Login mit dieser ID ebenfalls eingeloggt.
  await regenerateSession(req);
  req.session.userId = user.id;
  req.session.role = user.role;

  res.json(user);
}

export async function logout(req, res) {
  await destroySession(req);
  res.clearCookie(SESSION_COOKIE_NAME);
  res.status(204).end();
}

export function me(req, res) {
  const user = authService.getCurrentUser(req.session.userId);

  // Benutzer wurde gelöscht, während die Session noch lief
  if (!user) {
    throw new HttpError(401, 'Nicht angemeldet');
  }

  res.json(user);
}
