import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits, Partials } from "discord.js";

// Interaction Conditions Handler
import { InteractionConditions } from "./utils/preconditions/InteractionConditions";

import "@sapphire/plugin-logger/register";

// Setup dotenv for our '.env' file with our token under 'BOT_TOKEN
import dotenv from "dotenv";
dotenv.config();

// Setup our client
const bot = new SapphireClient({
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
    ],
    partials: [Partials.Channel],
    baseUserDirectory: __dirname + "/",
    loadMessageCommandListeners: true,
    defaultPrefix: "f>",
    disableMentionPrefix: true,
    caseInsensitivePrefixes: true,
});

// Setup our interactions handler
bot.interactionConditions = new InteractionConditions();

bot.login(process.env.BOT_TOKEN);
