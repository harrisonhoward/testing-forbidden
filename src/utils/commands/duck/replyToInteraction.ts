import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    MessageComponentInteraction,
} from "discord.js";

// Utils
import { fetchDuck } from "./fetchDuck";
import {
    autoDeferReply,
    sendDeferredResponse,
} from "../../interactions/interactionReplyUtil";

// Button ID
import { duckRefreshButtonID } from "../../../commands/Basic/duck";

export async function replyToInteraction(
    interaction: ChatInputCommandInteraction | MessageComponentInteraction
) {
    await autoDeferReply(interaction);

    // Buttons
    const refreshButton = new ButtonBuilder() //
        .setCustomId(duckRefreshButtonID)
        .setLabel("New Duck")
        .setStyle(ButtonStyle.Primary);

    // Action builder
    const row = new ActionRowBuilder<ButtonBuilder>() //
        .addComponents(refreshButton);

    // Embed builder
    const embed = new EmbedBuilder() //
        .setColor(0x2095ab)
        .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription("Oh look it's a Duck <:DuckLove:872281326588399647>");

    // Retrieve the image
    const duck = await fetchDuck(interaction, embed);
    if (typeof duck === "string") {
        embed.setImage(duck);
        return sendDeferredResponse(interaction, {
            embeds: [embed],
            components: [row],
        });
    }
}
