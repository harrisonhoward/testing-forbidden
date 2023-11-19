import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";

import { filterAsync } from "../../utils/arrayUtil";

// TODO Improve method for storing all groups
const REGISTERED_GROUPS: Group[] = [
    {
        name: "Basic",
        emoji: "📜",
    },
    {
        name: "Information",
        emoji: "🇮",
    },
    {
        name: "Founder",
        emoji: "👑",
        preconditions: ["ManagerOnly"],
    },
    {
        name: "Staff",
        emoji: "🛡️",
        preconditions: ["StaffOnly"],
    },
];
interface CommandGroup {
    group: Group;
    commands: Command[];
}
interface Group {
    name: string;
    emoji: string;
    preconditions?: string[];
}

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
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply();
        }

        // Get the available commands from the store
        const registeredCommands = interaction.client.stores.get("commands");
        // Using the global variable that stores information about our groups
        // Filter them based on preconditions (i.e. Founder is manager only)
        const commandGroups: CommandGroup[] = (
            await filterAsync(
                REGISTERED_GROUPS,
                async (group) =>
                    !Array.isArray(group.preconditions) ||
                    (await interaction.client.interactionConditions.checkPreconditions(
                        interaction,
                        group.preconditions
                    ))
            )
        ).map((group) => ({
            group,
            // Add a commands array to each group
            commands: registeredCommands
                .filter((command) => command.fullCategory[0] === group.name)
                .map((command) => command),
        }));

        // Map the groups to the interaction buttons
        const actionButtons = commandGroups.map((cmdGroup) =>
            new ButtonBuilder() //
                .setCustomId(`group_${cmdGroup.group.name.toLowerCase()}`)
                .setEmoji(cmdGroup.group.emoji)
                .setStyle(ButtonStyle.Primary)
        );

        // Add each button to the action row
        const row = new ActionRowBuilder<ButtonBuilder>();
        actionButtons.forEach((button) => row.addComponents(button));

        // Embed builder
        const embed = new EmbedBuilder() //
            .setColor(0x2095ab)
            .setTimestamp()
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            });

        // Build the embed for the groups
        // TODO implement the logic for arguments later
        embed.addFields([
            {
                name: "Information",
                value:
                    `Click on the emojis buttons to view the commands for that group\n` +
                    `You can view a group faster by filling it in the group argument`,
            },
            {
                name: "Groups",
                value:
                    commandGroups
                        .map(
                            (cmdGroup) =>
                                `${cmdGroup.group.emoji} ${cmdGroup.group.name} *(${cmdGroup.commands.length})*`
                        )
                        .join("\n") || "No groups found",
            },
        ]);

        interaction.editReply({
            content: "",
            embeds: [embed],
            components: [row],
        });
    }
}
