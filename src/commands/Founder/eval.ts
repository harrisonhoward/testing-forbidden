import { Command } from "@sapphire/framework";
import type { Message } from "discord.js";

export class EvalCommand extends Command {
    constructor(ctx: Command.Context, options: Command.Options) {
        super(ctx, {
            ...options,
            name: "eval",
            fullCategory: ["Founder"],
            description: "Evaluates unrestricted code within the bot scope.",
            preconditions: ["ManagerOnly"],
        });
    }

    public async messageRun(message: Message) {
        message.channel.send("lol");
    }
}
