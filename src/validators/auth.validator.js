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