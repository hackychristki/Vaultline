export const SESSION_COOKIE_NAME = 'vaultline.sid';

export function regenerateSession(req){
    return new Promise((resolve, reject) => {
        req.session.regenerate((err) => (err ? reject(err) : resolve()))
    })
}

export function destroySession(req){
    return new Promise((resolve, reject) => {
        req.session.destroy((err) => (err ? reject(err) : resolve()))
    })
}    