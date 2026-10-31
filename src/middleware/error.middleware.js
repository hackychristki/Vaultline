import { config } from "../config/index.js";

export function notFound(req, res){
    res.status(404).json({
        error:"Nicht gefunden"
    })
}

export function errorHandler(err, req, res, next){
    
    const status = err.status ?? 500;

    console.error(err);

    res.status(status).json({
        error: status === 500 && config.isProduction ? "Interner Serverfehler" : err.message
    })
}