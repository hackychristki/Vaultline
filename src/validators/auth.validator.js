import {z} from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Mindestens 3 Zeichen')
    .max(30, 'Höchstens 30 Zeichen')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Nur Buchstaben, Zahlen, _ . -'),
  password: z
    .string()
    .min(12, 'Mindestens 12 Zeichen')
    .max(128, 'Höchstens 128 Zeichen'), // Obergrenze schützt vor extrem teurem Hashing
});

// Beim Login bewusst KEINE Regeln wie Mindestlänge prüfen: Detaillierte
// Fehlermeldungen würden Angreifern verraten, wie Passwörter aussehen.
// Nur grobe Grenzen, damit niemand riesige Strings schickt.
export const loginSchema = z.object({
  username: z.string().trim().min(1).max(30),
  password: z.string().min(1).max(128),
});