import type {
    CommandInteraction,
    MessageComponentInteraction,
} from "discord.js";

import { preconditionFailure } from "..";

export const isStaff = (userID: string): boolean =>
    // TODO: Improve detection at the moment hard coding the IDs
    ["305488176267526147", "186683613440376833"].includes(userID);

export const staffOnlyFailure = <T extends Function | undefined>(
    interaction: CommandInteraction | MessageComponentInteraction,
    callback?: T
) =>
    preconditionFailure(
        "Only staff members are allowed to use this bot",
        interaction,
        callback
    );
