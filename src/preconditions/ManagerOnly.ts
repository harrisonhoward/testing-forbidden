import { Piece } from "@sapphire/framework";
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
        // TODO: Improve detection at the moment hard coding the IDs
        return ["305488176267526147", "186683613440376833"].includes(
            isMessage(interaction) ? interaction.author.id : interaction.user.id
        );
    }
}
