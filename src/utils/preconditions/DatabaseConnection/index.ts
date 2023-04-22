import type {
    CommandInteraction,
    MessageComponentInteraction,
    Client,
} from "discord.js";

import { preconditionFailure } from "..";

export const isDatabaseConnected = (client: Client): boolean =>
    client.provider.isConnected();

export const databaseConnectionFailure = <T extends Function | undefined>(
    interaction: CommandInteraction | MessageComponentInteraction,
    callback?: T
) =>
    preconditionFailure(
        "The database is currently unavailable, unable to process your command",
        interaction,
        callback
    );
