import app from "./app.js";
import { config } from "./config/index.js";
import { runMigrations } from './db/migrate.js';
import { closeDatabase } from './db/database.js';

runMigrations();

const server = app.listen(config.port, () => {
    console.log(`Vaultline läuft auf http://localhost:${config.port} (${config.env})`);
})

for(const signal of ["SIGINT", "SIGTERM"]){
    process.on(signal, () => {
        console.log(`${signal} empfangen, fahre herunter …`);
        closeDatabase();
        server.close(() => process.exit(0))
    })
}