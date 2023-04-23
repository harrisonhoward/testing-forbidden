import { AllFlowsPrecondition, Piece } from "@sapphire/framework";
import {
    CommandInteraction,
    ContextMenuCommandInteraction,
    Message,
    MessageComponentInteraction,
} from "discord.js";

// Util
import { preconditionFailure } from "../../utils/preconditions";

export class DatabaseConnectionPrecondition extends AllFlowsPrecondition {
    public constructor(
        context: Piece.Context,
        options: AllFlowsPrecondition.Options
    ) {
        super(context, {
            ...options,
            position: 12,
        });
    }

    public override async messageRun(message: Message) {
        return this.check(message);
    }

    public override async chatInputRun(interaction: CommandInteraction) {
        return this.check(interaction);
    }

    public override async contextMenuRun(
        interaction: ContextMenuCommandInteraction
    ) {
        return this.check(interaction);
    }

    private async check(
        interaction:
            | Message
            | CommandInteraction
            | ContextMenuCommandInteraction
    ) {
        if (DatabaseConnectionPrecondition.isValid(interaction)) {
            return this.ok();
        }
        return this.error({ identifier: "DatabaseConnection" });
    }

    public static isValid(
        interaction:
            | Message
            | CommandInteraction
            | ContextMenuCommandInteraction
            | MessageComponentInteraction
    ) {
        return interaction.client.provider.isConnected();
    }

    public static hasFailed<T extends Function | undefined>(
        interaction: CommandInteraction | MessageComponentInteraction,
        callback?: T
    ) {
        return preconditionFailure(
            "The database is currently unavailable, unable to process your command",
            interaction,
            callback
        );
    }
}
