import { Command } from "@sapphire/framework";
import { EmbedBuilder, type ButtonInteraction } from "discord.js";

import { isButtonInteration } from "../../isButtonInteraction";

export async function fetchDuck(
    interaction: Command.ChatInputCommandInteraction | ButtonInteraction,
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
        if (isButtonInteration(interaction)) {
            interaction.update({
                content: "",
                embeds: [embed],
            });
        } else {
            interaction.editReply({ content: "", embeds: [embed] });
        }
    }
}
