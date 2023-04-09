import { Command } from "@sapphire/framework";
import {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    ButtonInteraction,
} from "discord.js";

// Utilities
import { fetchDuck } from "./fetchDuck";
import { isButtonInteration } from "../../isButtonInteraction";

// Button ID
import { duckRefreshButtonID } from "../../../commands/duck";

export async function replyToInteraction(
    interaction: Command.ChatInputCommandInteraction | ButtonInteraction
) {
    const isButtonInteraction = isButtonInteration(interaction);
    if (!isButtonInteraction && !interaction.deferred && !interaction.replied) {
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
        // A button interaction caused this function to be called
        if (isButtonInteraction) {
            return interaction.update({
                content: "",
                embeds: [embed],
                components: [row],
            });
        }
        // A command interaction cause this function to be called
        return interaction.editReply({
            content: "",
            embeds: [embed],
            components: [row],
        });
    }
}
