import type { MessageComponentInteraction } from "discord.js";
import type { GlobalPrecondition } from "../utils/preconditions";

export interface HandledInteraction {
    interaction: MessageComponentInteraction;
    isValid: boolean;
}

export class InteractionConditions {
    private _preconditions: GlobalPrecondition[];

    constructor() {
        this._preconditions = [];
    }

    get preconditions(): typeof this._preconditions {
        return [...this._preconditions];
    }

    addPrecondition(precondition: (typeof this._preconditions)[number]) {
        this._preconditions.push(precondition);
    }
}
