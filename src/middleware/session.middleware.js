import session from 'express-session';
import { config } from '../config/index.js';
import { SqliteSessionStore } from '../db/session-store.js';
import { SESSION_COOKIE_NAME } from '../utils/session.js';

const ttlMs = config.sessionTtlMinutes * 60 * 1000;

export const sessionMiddleware = session({
  name: SESSION_COOKIE_NAME,         // eigener Name statt "connect.sid" verrät weniger über den Stack
  secret: config.sessionSecret,      // signiert die Session-ID im Cookie
  store: new SqliteSessionStore({ ttlMs }),
  resave: false,                     // nur speichern, wenn sich etwas geändert hat
  saveUninitialized: false,          // keine Sessions/Cookies für nicht eingeloggte Besucher
  rolling: true,                     // jede Anfrage verlängert das Cookie → Inaktivitäts-Timeout
  cookie: {
    httpOnly: true,                  // für JavaScript im Browser unsichtbar (Schutz vor XSS-Diebstahl)
    sameSite: 'strict',              // Cookie wird bei fremden Seiten nicht mitgeschickt (CSRF-Schutz)
    secure: config.isProduction,     // in Produktion nur über HTTPS
    maxAge: ttlMs,
  },
});
