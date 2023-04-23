import {
    InteractionHandler,
    InteractionHandlerTypes,
    PieceContext,
} from "@sapphire/framework";
import { type ButtonInteraction } from "discord.js";

// Button ID
import { duckRefreshButtonID } from "../commands/duck";

// Util
import { replyToInteraction } from "../utils/commands/duck/replyToInteraction";
import { passGlobalPreconditions } from "../utils/preconditions";

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
        return passGlobalPreconditions(interaction, this.some, this.none);
    }

    public async run(interaction: ButtonInteraction) {
        replyToInteraction(interaction);
    }
}
