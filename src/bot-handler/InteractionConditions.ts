import type { AllFlowsPrecondition } from "@sapphire/framework";
import type { MessageComponentInteraction } from "discord.js";
import type { GlobalPrecondition } from "../utils/preconditions";

export interface HandledInteraction {
    interaction: MessageComponentInteraction;
    isValid: boolean;
}

export class InteractionConditions {
    private _preconditions: GlobalPrecondition[];
    private _interactions: Record<
        MessageComponentInteraction["id"],
        HandledInteraction
    >;

    constructor() {
        this._preconditions = [];
        this._interactions = {};
    }

    get preconditions(): typeof this._preconditions {
        return [...this._preconditions];
    }

    get interactions(): typeof this._interactions {
        return { ...this._interactions };
    }

    addPrecondition(precondition: (typeof this._preconditions)[number]) {
        this._preconditions.push(precondition);
    }

    handleInteraction(
        interaction: MessageComponentInteraction,
        isValid: HandledInteraction["isValid"]
    ) {
        this._interactions[interaction.id] = { interaction, isValid };
    }
}
