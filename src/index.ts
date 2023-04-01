import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";

// Setup dotenv for our '.env' file with our token under 'BOT_TOKEN
import dotenv from "dotenv";
dotenv.config();

// Setup our client
const bot = new SapphireClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    defaultPrefix: process.env.PREFIX,
    baseUserDirectory: __dirname + "/",
});

bot.login(process.env.BOT_TOKEN);
