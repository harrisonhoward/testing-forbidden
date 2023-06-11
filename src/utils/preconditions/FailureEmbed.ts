import { EmbedBuilder, type Message } from "discord.js";

export const renderFailureEmbed = (
    message: Message,
    content: string
): EmbedBuilder =>
    new EmbedBuilder() //
        .setColor(0x2095ab)
        .setTimestamp()
        .setTitle("Command Failure")
        .setDescription(content)
        .setAuthor({
            name: message.author.tag,
            iconURL: message.author.displayAvatarURL(),
        });
