import { Piece } from "@sapphire/framework";
import {
    CommandInteraction,
    ContextMenuCommandInteraction,
    Message,
    MessageComponentInteraction,
} from "discord.js";
import {
    Precondition,
    PreconditionOptions,
} from "../../utils/preconditions/Precondition";

export class DatabaseConnectionPrecondition extends Precondition {
    public constructor(context: Piece.Context, options: PreconditionOptions) {
        super(context, {
            ...options,
            id: "DatabaseConnection",
            failedMessage:
                "The database is currently unavailable, unable to process your command",
            position: 12,
        });
    }

    public override isValid(
        interaction:
            | Message
            | CommandInteraction
            | ContextMenuCommandInteraction
            | MessageComponentInteraction
    ) {
        return interaction.client.provider.isConnected();
    }
}
