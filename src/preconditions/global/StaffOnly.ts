import type {
    CommandInteraction,
    ContextMenuCommandInteraction,
    Message,
    MessageComponentInteraction,
} from "discord.js";
import {
    LoaderContext,
    Precondition,
    PreconditionOptions,
} from "../../utils/preconditions/Precondition";

// Util
import { isMessage } from "../../utils/isMessage";
import { isUserStaff } from "../../utils/envUtil";

export class StaffOnlyPrecondition extends Precondition {
    public constructor(context: LoaderContext, options: PreconditionOptions) {
        super(context, {
            ...options,
            name: "StaffOnly",
            onFailure: "Only staff members are allowed to use this bot",
            position: 11,
        });
    }

    public override isValid(
        interaction:
            | Message
            | CommandInteraction
            | ContextMenuCommandInteraction
            | MessageComponentInteraction
    ) {
        const authorID = isMessage(interaction)
            ? interaction.author.id
            : interaction.user.id;

        return isUserStaff(interaction.client, authorID);
    }
}
