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
    ): boolean;
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
     *
     * @param preconditons Manual preconditions to execute
     */
    public passPreconditions(
        interaction: MessageComponentInteraction,
        conditions?: string[]
    ): boolean {
        const manualPreconditions = this.globalConditions.filter((condition) =>
            conditions?.includes(condition.key)
        );
        const conditionsToCheck = [
            ...this.globalConditions,
            ...manualPreconditions,
        ];
        for (const condition of conditionsToCheck) {
            if (!condition.precondition.isValid(interaction)) {
                condition.precondition.hasFailed(interaction);
                return false;
            }
        }
        return true;
    }
}
