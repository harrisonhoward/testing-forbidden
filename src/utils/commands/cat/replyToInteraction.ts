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
import { isMessageComponentInteraction } from "../../isMessageComponentInteraction";

// Button ID
import { catRefreshButtonID } from "../../../commands/Basic/cat";

export async function replyToInteraction(
    interaction: ChatInputCommandInteraction | MessageComponentInteraction
) {
    const fromMessageComponent = isMessageComponentInteraction(interaction);
    // Defer the interaction if it hasn't already been (command interaction)
    if (
        !fromMessageComponent &&
        !interaction.deferred &&
        !interaction.replied
    ) {
        await interaction.deferReply();
    }

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
        const responseObj = {
            content: "",
            embeds: [embed],
            components: [row],
        };
        // A button interaction caused this function to be called
        if (fromMessageComponent && !interaction.replied) {
            return interaction.update(responseObj);
        }
        // A command interaction cause this function to be called
        return interaction.editReply(responseObj);
    }
}
