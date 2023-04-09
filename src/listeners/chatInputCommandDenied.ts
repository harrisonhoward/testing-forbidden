import {
    Events,
    Listener,
    type ChatInputCommandDeniedPayload,
    type UserError,
} from "@sapphire/framework";
import { ChatInputCommandInteraction } from "discord.js";
import { CommandErrors } from "../";

export class ChatInputCommandDenied extends Listener<
    typeof Events.ChatInputCommandDenied
> {
    public run(
        error: UserError,
        { interaction }: ChatInputCommandDeniedPayload
    ) {
        if (Object.values(CommandErrors).includes(error.identifier)) {
            const func = this[error.identifier as CommandErrors];
            if (typeof func === "function") {
                return func(interaction);
            }
        }

        return interaction.reply({
            content:
                error.message ||
                "An error occurred when executing that command",
            ephemeral: true,
        });
    }

    private staffOnly(interaction: ChatInputCommandInteraction) {
        const content = "Only staff members are allowed to use this bot";
        if (interaction.deferred || interaction.replied) {
            return interaction.editReply({
                content,
            });
        }
        return interaction.reply({
            content,
            ephemeral: true,
        });
    }

    private databaseConnection(interaction: ChatInputCommandInteraction) {
        const content =
            "The database is currently unavailable, unable to process your command";
        if (interaction.deferred || interaction.replied) {
            return interaction.editReply({
                content,
            });
        }
        return interaction.reply({
            content,
            ephemeral: true,
        });
    }
}
