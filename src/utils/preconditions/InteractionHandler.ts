import {
    InteractionHandler as SF_InteractionHandler,
    container,
} from "@sapphire/framework";
import type { Interaction, ButtonInteraction } from "discord.js";

export type LoaderContext = SF_InteractionHandler.LoaderContext;

export interface InteractionHandlerOptions
    extends SF_InteractionHandler.Options {
    id: string;
    preconditions?: string[];
}

export abstract class InteractionHandler extends SF_InteractionHandler {
    public id: string;
    public preconditions?: string[];

    public constructor(ctx: LoaderContext, options: InteractionHandlerOptions) {
        super(ctx, options);
        this.id = options.id;
        this.preconditions = options.preconditions;
    }

    public override parse(interaction: ButtonInteraction) {
        if (
            interaction.customId !== this.id ||
            !container.client.interactionConditions.passPreconditions(
                interaction,
                this.preconditions
            )
        )
            return this.none();
        return this.validate(interaction);
    }

    abstract validate(
        interaction: Interaction
    ): ReturnType<SF_InteractionHandler["parse"]>;
}
