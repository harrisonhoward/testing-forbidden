import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    MessageComponentInteraction,
} from "discord.js";

// Utils
import { fetchCat } from "./fetchCat";
import {
    autoDeferReply,
    sendDeferredResponse,
} from "../../interactions/interactionReplyUtil";

// Button ID
import { catRefreshButtonID } from "../../../commands/Basic/cat";

export async function replyToInteraction(
    interaction: ChatInputCommandInteraction | MessageComponentInteraction
) {
    await autoDeferReply(interaction);

    // Buttons
    const refreshButton = new ButtonBuilder() //
        .setCustomId(catRefreshButtonID)
        .setLabel("New Cat")
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
        .setDescription("Oh look it's a Cat <:DuckLove:872281326588399647>");

    // Retrieve the image
    const cat = await fetchCat(interaction, embed);
    if (typeof cat === "string") {
        embed.setImage(cat);
        return sendDeferredResponse(interaction, {
            embeds: [embed],
            components: [row],
        });
    }
}
