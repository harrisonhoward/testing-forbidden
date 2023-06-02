import {
    InteractionHandler as SF_InteractionHandler,
    InteractionHandlerTypes,
    PieceContext,
    Option,
} from "@sapphire/framework";
import { Awaitable } from "@sapphire/utilities";
import type { Interaction, ButtonInteraction } from "discord.js";

// Util
import { passGlobalPreconditions } from "../preconditions";

export interface InteractionHandlerOptions
    extends SF_InteractionHandler.Options {
    id: string;
}

export abstract class InteractionHandler extends SF_InteractionHandler {
    public id: string;

    public constructor(ctx: PieceContext, options: InteractionHandlerOptions) {
        super(ctx, {
            ...options,
            name: "DuckRefreshButton",
            interactionHandlerType: InteractionHandlerTypes.Button,
        });
        this.id = options.id;
    }

    public override parse(interaction: ButtonInteraction) {
        if (
            interaction.customId !== this.id ||
            !passGlobalPreconditions(interaction)
        )
            return this.none();
        return this.validate(interaction);
    }

    abstract validate(interaction: Interaction): Awaitable<Option<unknown>>;
}
