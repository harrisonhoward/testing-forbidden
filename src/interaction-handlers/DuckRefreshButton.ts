import {
    InteractionHandler,
    InteractionHandlerTypes,
    PieceContext,
} from "@sapphire/framework";
import { type ButtonInteraction } from "discord.js";

// Button ID
import { duckRefreshButtonID } from "../commands/duck";

// Method
import { replyToInteraction } from "../utils/commands/duck/replyToInteraction";

export class DuckRefreshButton extends InteractionHandler {
    public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
        super(ctx, {
            ...options,
            name: "DuckRefreshButton",
            interactionHandlerType: InteractionHandlerTypes.Button,
        });
    }

    public override parse(interaction: ButtonInteraction) {
        if (interaction.customId !== duckRefreshButtonID) return this.none();
        return this.some();
    }

    public async run(interaction: ButtonInteraction) {
        replyToInteraction(interaction);
    }
}
