import type {
    CommandInteraction,
    MessageComponentInteraction,
    Client,
} from "discord.js";

import { preconditionFailure } from "..";

/**
 * Based on the provided client is capable of determining if the database is connected
 */
export const isDatabaseConnected = (client: Client): boolean =>
    client.provider.isConnected();

/**
 * Uses the generic function preconditionFailure when the database connection precondition fails
 */
export const databaseConnectionFailure = <T extends Function | undefined>(
    interaction: CommandInteraction | MessageComponentInteraction,
    callback?: T
) =>
    preconditionFailure(
        "The database is currently unavailable, unable to process your command",
        interaction,
        callback
    );
