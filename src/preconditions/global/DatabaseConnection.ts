import { AllFlowsPrecondition, Piece } from "@sapphire/framework";

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
        return this.databaseConnected();
    }

    public override async chatInputRun() {
        return this.databaseConnected();
    }

    public override async contextMenuRun() {
        return this.databaseConnected();
    }

    private async databaseConnected() {
        if (this.container.client.provider.isConnected()) {
            return this.ok();
        }
        return this.error({
            message: "The database is not connected, unable to execute command",
        });
    }
}
