import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import { SlashCommandBuilder } from "discord.js";

// Utilities
import { replyToInteraction } from "../../utils/commands/duck/replyToInteraction";

export const duckRefreshButtonID = "duckRefreshButton";

export class DuckCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: "duck",
            fullCategory: ["Basic"],
            description: "Returns a random duck image for your pleasure",
            requiredClientPermissions: ["SendMessages", "EmbedLinks"],
        });
    }

    public override registerApplicationCommands(
        registry: ApplicationCommandRegistry
    ) {
        const command = new SlashCommandBuilder() //
            .setName(this.name)
            .setDescription(this.description);
        registry.registerChatInputCommand(command, {
            idHints: ["1094452028664713236"],
        });
    }

    public override chatInputRun(
        interaction: Command.ChatInputCommandInteraction
    ) {
        return replyToInteraction(interaction);
    }
}
