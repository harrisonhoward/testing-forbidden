import { Command } from "@sapphire/framework";
import { type ButtonInteraction } from "discord.js";

export function isButtonInteration(
    interaction: Command.ChatInputCommandInteraction | ButtonInteraction
): interaction is ButtonInteraction {
    return typeof (interaction as ButtonInteraction).customId === "string";
}
