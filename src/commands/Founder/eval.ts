import { Command, Args } from "@sapphire/framework";
import { type Message, EmbedBuilder } from "discord.js";

// Exposed imports
import * as _envUtil from "../../utils/envUtil";

export class EvalCommand extends Command {
    constructor(ctx: Command.Context, options: Command.Options) {
        super(ctx, {
            ...options,
            name: "eval",
            fullCategory: ["Founder"],
            description: "Evaluates unrestricted code within the bot scope.",
            preconditions: ["ManagerOnly"],
            quotes: [],
        });
    }

    public async messageRun(message: Message, args: Args) {
        const embed = new EmbedBuilder() //
            .setColor(0x2095ab)
            .setTimestamp()
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL(),
            });

        const codeArgument = await args.rest("string").catch(() => "");
        // We need to extract the code from the string in cases where it maybe wrapped in a markdown code block
        const code =
            codeArgument.match(/`{3}([\w]*)\n([\S\s]+?)\n`{3}/im)?.[2] ||
            codeArgument;

        // No code to evaluate :(
        if (!code) {
            embed.setDescription(
                "Usually helps if you provide code to evaluate."
            );
            embed.setTimestamp(null);
            message.reply({ embeds: [embed] });
            return;
        }

        const loadingMessage = await message.reply("Evaluating...");

        // Apply input code to the embed
        embed.addFields([
            {
                name: "Input",
                value: `\`\`\`ts\n${code}\n\`\`\``,
                inline: false,
            },
        ]);

        // Expose variables
        const envUtil = _envUtil;

        // Evaluate code
        try {
            // Obfuscate the client token
            const tempBotToken = process.env.BOT_TOKEN;
            message.client.token = "NO_TOKEN_FOR_YOU";
            process.env.BOT_TOKEN = "NO_TOKEN_FOR_YOU";
            this.container.client.token = "NO_TOKEN_FOR_YOU";

            const result = JSON.stringify(
                (await eval(
                    code.replace(/tempbottoken/gim, '"NO_TOKEN_FOR_YOU"')
                )) || ""
            );
            if (
                !result ||
                typeof result !== "string" ||
                result.length < 1 ||
                result === '""'
            ) {
                embed.setDescription("No result was returned.");
            } else if (result.length < 1000 && code.length < 1000) {
                // Apply result to the embed
                embed.addFields([
                    {
                        name: "Output",
                        value: `\`\`\`ts\n${result}\n\`\`\``,
                        inline: false,
                    },
                ]);
            } else if (result.length < 4000 && code.length < 4000) {
                await loadingMessage.delete();
                await message.reply(
                    `**INPUT**\n` + `\`\`\`ts\n` + `${code}\n` + `\`\`\`\n`
                );
                message.reply(
                    `**OUTPUT**\n` + `\`\`\`ts\n` + `${result}\n` + `\`\`\`\n`
                );
                return;
            } else {
                embed.setDescription("Input or output was too large to send.");
            }

            // Restore references after code evaluation
            message.client.token = tempBotToken;
            process.env.BOT_TOKEN = tempBotToken;
            this.container.client.token = tempBotToken;
        } catch (err) {
            // Apply error to the embed
            embed.addFields([
                {
                    name: "Error",
                    value: `\`\`\`\n${err}\n\`\`\``,
                    inline: false,
                },
            ]);
        }

        await loadingMessage.delete();
        message.reply({ embeds: [embed] });
    }
}
