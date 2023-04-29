import {
    InteractionHandler,
    InteractionHandlerTypes,
    PieceContext,
} from "@sapphire/framework";
import type { Interaction } from "discord.js";

// Utils
import { passGlobalPreconditions } from "../utils/preconditions";

export class GlobalInteractionHandler extends InteractionHandler {
    public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
        super(ctx, {
            ...options,
            name: "GlobalInteractionHandler",
            interactionHandlerType: InteractionHandlerTypes.MessageComponent,
        });
    }

    public override parse(interaction: Interaction) {
        if (interaction.isMessageComponent()) {
            passGlobalPreconditions(interaction);
        }
        return this.none();
    }

    public run() {}
}
