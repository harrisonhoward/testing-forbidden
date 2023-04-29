import mongoose from "mongoose";

// Provider
import { MongoProvider } from "./provider/MongoProvider";
import * as Schemas from "./provider/schemas";

// Interaction Conditions Handler
import { InteractionConditions } from "./bot-handler/InteractionConditions";

// Type for our environment variables
interface Env {
    // Bot settings
    BOT_TOKEN: string;
    // Database provider
    DB_HOSTNAME: string;
    DB_PORT: number;
    DB_DATABASE: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
}

// Create a type for our database provider
type BotProvider = MongoProvider<{ guilds: typeof Schemas.GuildSchema }>;

// Create a type for all of the group options in our commands
type GroupOptions = "basic";

declare global {
    namespace NodeJS {
        // Include out environment variables in process.env
        interface ProcessEnv extends Env {}
    }
    namespace globalThis {
        // Resetting these types as they accept anything
        function isNaN(value: unknown): boolean;
        function parseInt(value: unknown, radix?: number): number;
    }

    interface Array {
        // Update the includes function in arrays to be more generic
        includes(searchElement: unknown, fromIndex?: number): boolean;
    }

    // New global type that is a conditional return type
    type ReturnTypeOr<T, K> = T extends () => infer R ? R : K;
}

declare module "@sapphire/framework" {
    interface SapphireClient {
        // Apply our provider to the SapphireClient
        provider: BotProvider;
        // Apply our interaction conditions handler to the SapphireClient
        interactionConditions: InteractionConditions;
    }

    interface CommandOptions {
        // Add a new group option to the command options
        group?: GroupOptions;
    }
}

declare module "discord.js" {
    interface Client {
        // Apply our provider to the Discord.js Client
        provider: BotProvider;
        // Apply our interaction conditions handler to the Discord.js Client
        interactionConditions: InteractionConditions;
    }
}
