import { AllFlowsPrecondition, Piece, Result } from "@sapphire/framework";
import type {
    CommandInteraction,
    ContextMenuCommandInteraction,
    Message,
} from "discord.js";

export class StaffOnlyPrecondition extends AllFlowsPrecondition {
    public constructor(
        context: Piece.Context,
        options: AllFlowsPrecondition.Options
    ) {
        super(context, {
            ...options,
            position: 11,
        });
    }

    public override async messageRun(message: Message) {
        return this.checkStaff(message.author.id);
    }

    public override async chatInputRun(interaction: CommandInteraction) {
        return this.checkStaff(interaction.user.id);
    }

    public override async contextMenuRun(
        interaction: ContextMenuCommandInteraction
    ) {
        return this.checkStaff(interaction.user.id);
    }

    private async checkStaff(userID: string) {
        // TODO: Improve detection at the moment hard coding the IDs
        if (["305488176267526147", "186683613440376833"].includes(userID)) {
            return this.ok();
        }
        return this.error({
            message: "This bot is currently locked to specific users only",
        });
    }
}
