import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageComponentInteraction,
} from "discord.js";

import { getCommandsByGroup } from "./util";
import {
    autoDeferReply,
    sendDeferredResponse,
} from "../../interactions/interactionReplyUtil";

export async function replyWithGroups(
    interaction: ChatInputCommandInteraction | MessageComponentInteraction
) {
    await autoDeferReply(interaction);

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

    return sendDeferredResponse(interaction, {
        embeds: [embed],
        components: [row],
    });
}
