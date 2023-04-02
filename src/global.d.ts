export interface Env {
    // Bot settings
    BOT_TOKEN: string;
    PREFIX: string;
    // Database provider
    DB_HOSTNAME: string;
    DB_PORT: number;
    DB_DATABASE: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
}

declare global {
    // Extend process.env to include our custom variables
    namespace NodeJS {
        interface ProcessEnv extends Env {}
    }
    // Reset types of isNaN and parseInt to accept unknown
    namespace globalThis {
        function isNaN(value: unknown): boolean;
        function parseInt(value: unknown, radix?: number): number;
    }
}
