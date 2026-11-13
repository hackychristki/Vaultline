
const port = Number(process.env.PORT ?? 3000);

const sessionSecret = process.env.SESSION_SECRET;

// Mindestens 32 Zeichen. Den Wert selbst NIE in die Fehlermeldung schreiben,
// sonst landet das Secret im Log.
if(!sessionSecret || sessionSecret.length < 32){
    throw new Error('SESSION_SECRET fehlt oder ist kürzer als 32 Zeichen');
}

if(!Number.isInteger(port) || port <= 0){
    throw new Error(`ungültiger port${port}`);
    
}

export const config = Object.freeze({
    env: process.env.NODE_ENV ?? 'development',
    port,
    isProduction: process.env.NODE_ENV === "production",
    dbPath: process.env.DB_PATH ?? 'data/vaultline.db',
    sessionSecret,
    sessionTtlMinutes: 30,
})