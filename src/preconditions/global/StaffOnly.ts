import { AllFlowsPrecondition, Piece } from "@sapphire/framework";
import type {
    CommandInteraction,
    ContextMenuCommandInteraction,
    Message,
    MessageComponentInteraction,
} from "discord.js";

// Util
import { preconditionFailure } from "../../utils/preconditions";
import { isMessage } from "../../utils/isMessage";

export class StaffOnlyPrecondition extends AllFlowsPrecondition {
    public constructor(
        context: Piece.Context,
        options: AllFlowsPrecondition.Options
    ) {
        super(context, {
            ...options,
            position: 11,
        });
        this.container.client.interactionConditions.addPrecondition(
            StaffOnlyPrecondition
        );
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

    private check(
        interaction:
            | Message
            | CommandInteraction
            | ContextMenuCommandInteraction
    ) {
        if (StaffOnlyPrecondition.isValid(interaction)) {
            return this.ok();
        }
        return this.error({ identifier: "StaffOnly" });
    }

    public static isValid(
        interaction:
            | Message
            | CommandInteraction
            | ContextMenuCommandInteraction
            | MessageComponentInteraction
    ) {
        // TODO: Improve detection at the moment hard coding the IDs
        return ["_305488176267526147", "186683613440376833"].includes(
            isMessage(interaction) ? interaction.author.id : interaction.user.id
        );
    }

    public static hasFailed<T extends Function | undefined>(
        interaction: CommandInteraction | MessageComponentInteraction,
        callback?: T
    ) {
        return preconditionFailure(
            "Only staff members are allowed to use this bot",
            interaction,
            callback
        );
    }
}
