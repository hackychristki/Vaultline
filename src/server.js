import app from "./app.js"

import { config } from "./config/index.js"

const server = app.listen(config.port, () => {
    console.log(`Vaultline läuft auf http://localhost:${config.port} (${config.env})`);
})

for(const signal of ["SIGINT", "SIGTERM"]){
    process.on(signal, () => {
        console.log(`${signal} empfangen, fahre herunter …`);
        server.close(() => process.exit(0))
    })
}