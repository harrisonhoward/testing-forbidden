import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageComponentInteraction,
} from "discord.js";

import { isMessageComponentInteraction } from "../../isMessageComponentInteraction";

/**
 * Fetches a random duck image from the random-d.uk API
 * Will use the provided embed builder to send an error message if an error occurs
 */
export async function fetchDuck(
    interaction: ChatInputCommandInteraction | MessageComponentInteraction,
    embed: EmbedBuilder
): Promise<string | void> {
    try {
        const response = await fetch("https://random-d.uk/api/v2/random");
        const json = await response.json();
        return json.url;
    } catch (err) {
        embed //
            .setDescription("An unexepected error occurred")
            .addFields({ name: "Error", value: `\`\`\`${err}\`\`\`` });
        if (isMessageComponentInteraction(interaction)) {
            interaction.update({
                content: "",
                embeds: [embed],
            });
        } else {
            interaction.editReply({ content: "", embeds: [embed] });
        }
    }
}
