
const port = Number(process.env.PORT ?? 3000);

if(!Number.isInteger(port) || port <= 0){
    throw new Error(`ungültiger port${port}`);
    
}

export const config = Object.freeze({
    env: process.env.NODE_ENV ?? 'development',
    port,
    isProduction: process.env.NODE_ENV === "production"
})