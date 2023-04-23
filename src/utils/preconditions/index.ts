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

/**
 * Will execute onOk if all global preconditions are met otherwise it will execute onError
 */
export const passGlobalConditions = <S extends () => any, F extends () => any>(
    interaction: MessageComponentInteraction,
    onOk: S,
    onError: F
): Promise<ReturnType<S | F>> => {
    return new Promise(async (resolve, reject) => {
        const preconditonsToCheck: GlobalPrecondition[] = [];
        // Loop through all of the preconditions in the store
        // For every precondition that has a position is determined to be global
        // We dynamically import the precondition and add it to an array to be checked
        for (const precondition of interaction.client.stores
            .get("preconditions")
            .values()) {
            // Determine if the precondition is global
            if (typeof precondition.position === "number") {
                try {
                    // Dynamically import the precondition
                    const module = await import(precondition.location.full);
                    if (module[`${precondition.name}Precondition`]) {
                        preconditonsToCheck.push(
                            module[`${precondition.name}Precondition`]
                        );
                    }
                } catch (err) {
                    reject(err);
                }
            }
        }
        for (const precondition of preconditonsToCheck) {
            // Keep in mind if a global precondition doesn't have these functions it won't work
            if (precondition.isValid && !precondition.isValid(interaction)) {
                resolve(precondition.hasFailed(interaction, onError));
                return;
            }
        }
        resolve(onOk());
    });
};
