import type {
    CommandInteraction,
    MessageComponentInteraction,
    InteractionResponse,
    Message,
    ContextMenuCommandInteraction,
} from "discord.js";

export interface GlobalPrecondition {
    isValid(
        interaction:
            | Message
            | CommandInteraction
            | ContextMenuCommandInteraction
            | MessageComponentInteraction
    ): boolean;
    hasFailed<T extends Function | undefined>(
        interaction: CommandInteraction | MessageComponentInteraction,
        callback?: T
    ): ReturnTypeOr<
        T,
        Promise<Message<boolean> | InteractionResponse<boolean>>
    >;
}

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

// TODO: passGlobalPreconditions can actually be handled on InteractionConditions
// TODO: Add type for a specific preconditon "global" "manual" and apply this to the runPrecondiions function

/**
 * Will execute onOk if all global preconditions are met otherwise it will execute onError
 */
export const passGlobalPreconditions = (
    interaction: MessageComponentInteraction
): boolean => {
    const interactionConditions = interaction.client.interactionConditions;
    for (const precondition of interactionConditions.preconditions) {
        if (precondition.isValid && precondition.hasFailed) {
            const result = precondition.isValid(interaction);
            if (!result) {
                precondition.hasFailed(interaction);
                return false;
            }
        }
    }
    return true;
};
