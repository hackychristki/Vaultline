import { config } from "../config/index.js";

export function notFound(req, res){
    res.status(404).json({
        error:"Nicht gefunden"
    })
}

export function errorHandler(err, req, res, next){
    
      const status =
    Number.isInteger(err.status) && err.status >= 400 && err.status <= 599
      ? err.status
      : 500;

    if(status >= 500){
        console.err(err);
    }

    const body = {
        error: status === 500 && config.isProduction ? "Interner Serverfehler" : err.message 
    }

    if(err.details){
        body.details = err.details
    }

    res.status(status).json(body)
}