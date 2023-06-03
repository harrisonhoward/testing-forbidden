import { Piece } from "@sapphire/framework";
import {
    InteractionType,
    type CommandInteraction,
    type ContextMenuCommandInteraction,
    type Message,
    type MessageComponentInteraction,
} from "discord.js";
import {
    Precondition,
    PreconditionOptions,
} from "../../utils/preconditions/Precondition";

// Util
import { isMessage } from "../../utils/isMessage";

export class StaffOnlyPrecondition extends Precondition {
    public constructor(context: Piece.Context, options: PreconditionOptions) {
        super(context, {
            ...options,
            id: "StaffOnly",
            failedMessage: "Only staff members are allowed to use this bot",
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
