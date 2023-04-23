import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";

import "@sapphire/plugin-logger/register";

// Setup dotenv for our '.env' file with our token under 'BOT_TOKEN
import dotenv from "dotenv";
dotenv.config();

// Setup our client
const bot = new SapphireClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    baseUserDirectory: __dirname + "/",
    loadMessageCommandListeners: true,
});

bot.login(process.env.BOT_TOKEN);

// GLOBAL TYPES FOR THE BOT

export const CommandErrors = {
    StaffOnly: "StaffOnly",
    DatabaseConnection: "DatabaseConnection",
} as const;
export type CommandErrors = (typeof CommandErrors)[keyof typeof CommandErrors];
