import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export class PingCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: "ping",
            fullCategory: ["Basic"],
            description: "Will return the current bot latency",
            requiredClientPermissions: ["SendMessages", "EmbedLinks"],
        });
    }

    public override registerApplicationCommands(
        registry: ApplicationCommandRegistry
    ) {
        const command = new SlashCommandBuilder() //
            .setName(this.name)
            .setDescription(this.description);
        registry.registerChatInputCommand(command, {
            idHints: ["1094189349647687781"],
        });
    }

    public override async chatInputRun(
        interaction: Command.ChatInputCommandInteraction
    ) {
        const output = await interaction.deferReply({
            fetchReply: true,
        });

        // Determine the output is a message instance
        if (isMessageInstance(output)) {
            const embed = new EmbedBuilder()
                .setColor(0x2095ab)
                .setTitle("Pong! :ping_pong:")
                .setDescription(
                    `**Discord API**: ${Math.round(
                        this.container.client.ws.ping
                    )}ms\n` +
                        `**Response Time**: ${
                            output.createdTimestamp -
                            interaction.createdTimestamp
                        }ms`
                );
            return interaction.editReply({ content: "", embeds: [embed] });
        }

        return interaction.editReply({
            content: "I was unable to determine the client latency",
        });
    }
}
