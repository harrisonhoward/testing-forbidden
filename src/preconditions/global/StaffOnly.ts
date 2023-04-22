import { AllFlowsPrecondition, Piece } from "@sapphire/framework";
import type {
    CommandInteraction,
    ContextMenuCommandInteraction,
    Message,
} from "discord.js";

// Util
import { isStaff } from "../../utils/preconditions/StaffOnly";

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
        return this.check(message.author.id);
    }

    public override async chatInputRun(interaction: CommandInteraction) {
        return this.check(interaction.user.id);
    }

    public override async contextMenuRun(
        interaction: ContextMenuCommandInteraction
    ) {
        return this.check(interaction.user.id);
    }

    private check(userID: string) {
        if (isStaff(userID)) {
            return this.ok();
        }
        return this.error({ identifier: "staffOnly" });
    }
}
