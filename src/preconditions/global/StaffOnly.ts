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
} from "../../utils/preconditions/Precondition";

// Util
import { isMessage } from "../../utils/isMessage";

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
        // TODO: Improve detection at the moment hard coding the IDs
        return ["305488176267526147", "186683613440376833"].includes(
            isMessage(interaction) ? interaction.author.id : interaction.user.id
        );
    }
}
