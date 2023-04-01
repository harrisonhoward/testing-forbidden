import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";

import NodeLogger from "forbidden-node-logger";

// Setup dotenv for our '.env' file with our token under 'BOT_TOKEN
import dotenv from "dotenv";
dotenv.config();

// Setup our client
const client = new SapphireClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Setup our logger
export const Logger = new NodeLogger.Logger({ dirPath: __dirname + "/logs" });

client.login(process.env.BOT_TOKEN);
