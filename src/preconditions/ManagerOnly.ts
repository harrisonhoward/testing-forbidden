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
} from "../utils/preconditions/Precondition";

// Util
import { isMessage } from "../utils/isMessage";
import { isUserManager } from "../utils/envUtil";

export class ManagerOnlyPrecondition extends Precondition {
    public constructor(context: LoaderContext, options: PreconditionOptions) {
        super(context, {
            ...options,
            name: "ManagerOnly",
            onFailure: "This command is limited to the Managers only.",
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

        return isUserManager(interaction.client, authorID);
    }
}
