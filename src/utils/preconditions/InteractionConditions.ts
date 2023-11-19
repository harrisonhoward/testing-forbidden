import type {
    MessageComponentInteraction,
    Message,
    CommandInteraction,
    ContextMenuCommandInteraction,
    InteractionResponse,
} from "discord.js";

export interface Condition {
    isValid(
        interaction:
            | Message
            | CommandInteraction
            | ContextMenuCommandInteraction
            | MessageComponentInteraction
    ): boolean | Promise<boolean>;
    hasFailed<T extends Function | undefined>(
        interaction: CommandInteraction | MessageComponentInteraction | Message,
        callback?: T
    ): ReturnTypeOr<
        T,
        Promise<Message<boolean> | InteractionResponse<boolean>>
    >;
}

export enum InteractionConditionType {
    Global = "global",
    Manual = "manual",
}

export interface DefaultInteractionCondition {
    key: string;
    type: InteractionConditionType;
    precondition: Condition;
}

export interface GlobalInteractionCondition
    extends DefaultInteractionCondition {
    type: InteractionConditionType.Global;
    /**
     * Global preconditions require an order so they are executed in that specific order
     */
    order: number;
}

export interface ManualInteractionCondition
    extends DefaultInteractionCondition {
    type: InteractionConditionType.Manual;
}

export type InteractionCondition =
    | GlobalInteractionCondition
    | ManualInteractionCondition;

export class InteractionConditions {
    private _globalConditions: GlobalInteractionCondition[];
    private _manualConditions: ManualInteractionCondition[];

    constructor() {
        this._globalConditions = [];
        this._manualConditions = [];
    }

    public get conditions(): InteractionCondition[] {
        return [...this._globalConditions, ...this._manualConditions];
    }

    public get globalConditions(): GlobalInteractionCondition[] {
        return [...this._globalConditions].sort((a, b) => a.order - b.order);
    }

    public get manualConditions(): ManualInteractionCondition[] {
        return [...this._manualConditions];
    }

    public addPrecondition(condition: InteractionCondition) {
        switch (condition.type) {
            case InteractionConditionType.Global:
                this._globalConditions.push(condition);
                break;
            case InteractionConditionType.Manual:
                this._manualConditions.push(condition);
                break;
        }
    }

    /**
     * This will only check the provided preconditions
     * Truthy if all preconditions pass
     *
     * @param interaction
     * @param conditions
     */
    public async checkPreconditions(
        interaction: CommandInteraction | MessageComponentInteraction | Message,
        conditions?: string[]
    ): Promise<boolean> {
        // Convert the inputted conditions into a dictionary
        const conditionsByKey = (conditions || []).reduce(
            (acc: Record<string, boolean>, condition) => ({
                ...acc,
                [condition]: true,
            }),
            {}
        );
        // Return an array of all the preconditions found
        const conditionsToCheck = this.conditions.filter(
            (condition) => conditionsByKey[condition.key]
        );
        // Return the response
        for (const condition of conditionsToCheck) {
            const isValid = await condition.precondition.isValid(interaction);
            if (!isValid) return false;
        }
        return true;
    }

    /**
     * This will check if the manual preconditions and global conditions passed.
     * Automatically throws an error
     *
     * @param interaction
     * @param conditions Manual preconditions to execute
     */
    public async passPreconditions(
        interaction: CommandInteraction | MessageComponentInteraction | Message,
        conditions?: string[]
    ): Promise<boolean> {
        // Convert the inputted conditions into a dictionary
        const conditionsByKey = (conditions || []).reduce(
            (acc: Record<string, boolean>, condition) => ({
                ...acc,
                [condition]: true,
            }),
            {}
        );
        // Return all the valid manual preconditions
        const manualPreconditions = this.manualConditions.filter(
            (condition) => conditionsByKey[condition.key]
        );
        // Include all global preconditions in the array
        const conditionsToCheck = [
            ...this.globalConditions,
            ...manualPreconditions,
        ];
        // Loop the array and run the `isValid` method
        // If it isn't valid run the `hasFailed` method and return the result
        for (const condition of conditionsToCheck) {
            const isValid = await condition.precondition.isValid(interaction);
            if (!isValid) {
                condition.precondition.hasFailed(interaction);
                return false;
            }
        }
        return true;
    }
}
