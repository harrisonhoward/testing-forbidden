import { Listener } from "@sapphire/framework";
import type { Client } from "discord.js";

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
            this.container.logger.error(
                "Ready : Bot has initialised with no user"
            );
            return;
        }
        this.container.logger.info(
            `Ready : Bot has initialised as ${bot.user.tag} (${bot.user.id})`
        );
    }
}
