import {
    Events,
    Listener,
    type ChatInputCommandDeniedPayload,
    type UserError,
} from "@sapphire/framework";
import { ChatInputCommandInteraction } from "discord.js";
import { CommandErrors } from "../";

// Util
import { staffOnlyFailure } from "../utils/preconditions/StaffOnly";
import { databaseConnectionFailure } from "../utils/preconditions/DatabaseConnection";

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
        return staffOnlyFailure(interaction);
    }

    private databaseConnection(interaction: ChatInputCommandInteraction) {
        return databaseConnectionFailure(interaction);
    }
}
