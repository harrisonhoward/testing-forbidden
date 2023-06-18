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
export async function fetchCat(
    interaction: ChatInputCommandInteraction | MessageComponentInteraction,
    embed: EmbedBuilder
): Promise<string | void> {
    try {
        const response = await fetch(
            "https://api.thecatapi.com/v1/images/search",
            {
                headers: {
                    "x-api-key": process.env.CAT_API,
                },
            }
        );
        const json = await response.json();
        return json[0].url;
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
