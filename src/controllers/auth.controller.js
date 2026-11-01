import * as authService from '../services/auth.service.js';

// Kein try/catch nötig: Express 5 leitet Fehler aus async-Funktionen
// automatisch an den errorHandler weiter (Express 4 konnte das nicht).
export async function register(req, res) {
  const user = await authService.register(req.body);
  res.status(201).json(user);
}