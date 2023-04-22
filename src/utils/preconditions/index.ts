import type {
    CommandInteraction,
    MessageComponentInteraction,
    InteractionResponse,
    Message,
} from "discord.js";

// Global preconditions
import { isStaff, staffOnlyFailure } from "./StaffOnly";
import {
    isDatabaseConnected,
    databaseConnectionFailure,
} from "./DatabaseConnection";

/**
 * Generic function that is executed when a precondition fails
 * If you provide a callback it will use that as the return type
 */
export const preconditionFailure = <T extends Function | undefined>(
    content: string,
    interaction: CommandInteraction | MessageComponentInteraction,
    callback?: T
): ReturnTypeOr<
    T,
    Promise<InteractionResponse<boolean> | Message<boolean>>
> => {
    let reply;
    if (interaction.deferred || interaction.replied) {
        reply = interaction.editReply({
            content,
        });
    }
    reply = interaction.reply({
        content,
        ephemeral: true,
    });
    return callback ? callback() : reply;
};

/**
 * Will execute onOk if all global preconditions are met otherwise it will execute onError
 */
export const passGlobalConditions = <S extends () => any, F extends () => any>(
    interaction: MessageComponentInteraction,
    onOk: S,
    onError: F
): ReturnType<S | F> => {
    if (!isStaff(interaction.user.id)) {
        return staffOnlyFailure(interaction, onError);
    }
    if (!isDatabaseConnected(interaction.client)) {
        return databaseConnectionFailure(interaction, onError);
    }
    return onOk();
};
