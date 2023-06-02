import { InteractionHandlerTypes, PieceContext } from "@sapphire/framework";
import { type ButtonInteraction } from "discord.js";
import {
    InteractionHandler,
    InteractionHandlerOptions,
} from "../utils/preconditions/InteractionHandler";

// Button ID
import { duckRefreshButtonID } from "../commands/duck";

// Util
import { replyToInteraction } from "../utils/commands/duck/replyToInteraction";

export class DuckRefreshButton extends InteractionHandler {
    public constructor(ctx: PieceContext, options: InteractionHandlerOptions) {
        super(ctx, {
            ...options,
            id: duckRefreshButtonID,
            name: "DuckRefreshButton",
            interactionHandlerType: InteractionHandlerTypes.Button,
        });
    }

    public override validate() {
        return this.some();
    }

    public async run(interaction: ButtonInteraction) {
        replyToInteraction(interaction);
    }
}
