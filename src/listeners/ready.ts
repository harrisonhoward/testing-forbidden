import { Listener } from "@sapphire/framework";
import type { Client } from "discord.js";

// Provider
import { MongoProvider } from "../provider/MongoProvider";
import * as Schemas from "../provider/schemas";

export class ReadyListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            event: "ready",
            once: true,
        });
    }

    public run(bot: Client) {
        if (!bot.user) {
            throw new Error("Ready: Bot has initialised without a user");
        }
        this.container.logger.info(
            `Ready: Bot has initialised as ${bot.user.tag} (${bot.user.id})`
        );

        // Once the bot is ready attach a new provider instance
        // This doesn't mean the database is connected yet
        bot.provider = new MongoProvider(
            {
                hostname: process.env.DB_HOSTNAME,
                port: process.env.DB_PORT,
                database: process.env.DB_DATABASE,
                auth: {
                    username: process.env.DB_USERNAME,
                    password: process.env.DB_PASSWORD,
                },
            },
            { guilds: Schemas.GuildSchema }
        );
    }
}
