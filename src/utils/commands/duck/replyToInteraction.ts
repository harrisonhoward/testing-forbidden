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
import { isMessageComponentInteraction } from "../../isMessageComponentInteraction";

// Button ID
import { duckRefreshButtonID } from "../../../commands/Basic/duck";

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
