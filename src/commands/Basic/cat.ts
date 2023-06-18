import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import { SlashCommandBuilder } from "discord.js";

// Utilities
import { replyToInteraction } from "../../utils/commands/cat/replyToInteraction";

export const catRefreshButtonID = "catRefreshButton";

export class CatCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: "cat",
            fullCategory: ["Basic"],
            description: "Returns a random cat image for your pleasure",
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
            idHints: ["1119785738175774761"],
        });
    }

    public override chatInputRun(
        interaction: Command.ChatInputCommandInteraction
    ) {
        return replyToInteraction(interaction);
    }
}
