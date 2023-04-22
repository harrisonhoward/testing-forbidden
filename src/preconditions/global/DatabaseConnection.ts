import { AllFlowsPrecondition, Piece } from "@sapphire/framework";

// Util
import { isDatabaseConnected } from "../../utils/preconditions/DatabaseConnection";

export class StaffOnlyPrecondition extends AllFlowsPrecondition {
    public constructor(
        context: Piece.Context,
        options: AllFlowsPrecondition.Options
    ) {
        super(context, {
            ...options,
            position: 12,
        });
    }

    public override async messageRun() {
        return this.check();
    }

    public override async chatInputRun() {
        return this.check();
    }

    public override async contextMenuRun() {
        return this.check();
    }

    private async check() {
        if (isDatabaseConnected(this.container.client)) {
            return this.ok();
        }
        return this.error({ identifier: "databaseConnection" });
    }
}
