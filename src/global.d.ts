export interface Env {
    BOT_TOKEN: string;
}

// Extend process.env to include our custom variables
declare global {
    namespace NodeJS {
        interface ProcessEnv extends Env {}
    }
}
