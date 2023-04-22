import {
    ChatInputCommandInteraction,
    MessageComponentInteraction,
} from "discord.js";

/**
 * Based on the provided interaction determine if it is a button interaction
 */
export function isMessageComponentInteraction(
    interaction: ChatInputCommandInteraction | MessageComponentInteraction
): interaction is MessageComponentInteraction {
    return (
        typeof (interaction as MessageComponentInteraction).customId ===
        "string"
    );
}
