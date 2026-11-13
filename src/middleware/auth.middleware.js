import { HttpError } from '../utils/http-error.js';

// Lässt nur eingeloggte Benutzer durch
export function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return next(new HttpError(401, 'Nicht angemeldet'));
  }
  next();
}

// Lässt nur bestimmte Rollen durch, z. B. requireRole('berater').
// Prüft auch gleich die Anmeldung, man kann es also allein verwenden.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session?.userId) {
      return next(new HttpError(401, 'Nicht angemeldet'));
    }
    if (!roles.includes(req.session.role)) {
      return next(new HttpError(403, 'Keine Berechtigung'));
    }
    next();
  };
}
