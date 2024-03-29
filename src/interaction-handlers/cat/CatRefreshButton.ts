import { InteractionHandlerTypes } from "@sapphire/framework";
import { type ButtonInteraction } from "discord.js";
import {
    InteractionHandler,
    InteractionHandlerOptions,
    LoaderContext,
} from "../../utils/preconditions/InteractionHandler";

// Button ID
import { catRefreshButtonID } from "../../commands/Basic/cat";

// Util
import { replyToInteraction } from "../../utils/commands/cat/replyToInteraction";

export class CatRefreshButton extends InteractionHandler {
    public constructor(ctx: LoaderContext, options: InteractionHandlerOptions) {
        super(ctx, {
            ...options,
            id: catRefreshButtonID,
            name: "CatRefreshButton",
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
