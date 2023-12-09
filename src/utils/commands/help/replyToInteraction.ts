import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageComponentInteraction,
} from "discord.js";

import { isMessageComponentInteraction } from "../../isMessageComponentInteraction";
import { getCommandsByGroup } from "./util";

export async function replyWithGroups(
    interaction: ChatInputCommandInteraction | MessageComponentInteraction
) {
    const fromMessageComponent = isMessageComponentInteraction(interaction);
    // Defer the ineraction if it hasn't already been (command interaction)
    if (
        !fromMessageComponent &&
        !interaction.deferred &&
        !interaction.replied
    ) {
        await interaction.deferReply();
    }

    const commandGroups = await getCommandsByGroup(
        interaction.client,
        interaction
    );

    // Create a button per group
    const actionButtons = commandGroups.map(({ group }) =>
        new ButtonBuilder() //
            .setCustomId(`group_${group.name.toLowerCase()}`)
            .setEmoji(group.emoji)
            .setStyle(ButtonStyle.Primary)
    );

    // Add the buttons to a action row
    const row = new ActionRowBuilder<ButtonBuilder>();
    actionButtons.forEach((button) => row.addComponents(button));

    // Embed Builder
    const embed = new EmbedBuilder() //
        .setColor(0x2095ab)
        .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .addFields([
            {
                name: "Information",
                value:
                    `Click on the emoji buttons to view commands for that group.\n` +
                    `You can view a group faster by typing \`/help <group>\`.`,
            },
            {
                name: "Groups",
                value:
                    commandGroups
                        .map(
                            (cmdGroup) =>
                                `${cmdGroup.group.emoji} ${cmdGroup.group.name} *${cmdGroup.commands.length}*`
                        )
                        .join("\n") || "No groups found",
            },
        ]);

    // Response to the interaction
    const responseObj = {
        content: "",
        embeds: [embed],
        components: [row],
    };
    // A button interaction cause this function to be called
    if (fromMessageComponent && !interaction.replied) {
        return interaction.update(responseObj);
    }
    // A command interaction cause this function to be called
    return interaction.editReply(responseObj);
}
