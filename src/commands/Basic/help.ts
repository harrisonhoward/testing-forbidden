import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import { replyWithGroups } from "../../utils/commands/help/replyToInteraction";

export class HelpCommand extends Command {
    public constructor(
        context: Command.LoaderContext,
        options: Command.Options
    ) {
        super(context, {
            ...options,
            name: "help",
            fullCategory: ["Basic"],
            description:
                "Returns all command groups and their respective commands",
            requiredClientPermissions: ["SendMessages", "EmbedLinks"],
        });
    }

    public override registerApplicationCommands(
        registry: ApplicationCommandRegistry
    ) {
        const command = new SlashCommandBuilder() //
            .setName(this.toJSON().name)
            .setDescription(this.description);
        registry.registerChatInputCommand(command, {
            idHints: ["1117332275823116379"],
        });
    }

    public override async chatInputRun(
        interaction: Command.ChatInputCommandInteraction
    ) {
        return replyWithGroups(interaction);
    }
}
