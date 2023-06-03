import { AllFlowsPrecondition, Piece } from "@sapphire/framework";
import {
    CommandInteraction,
    ContextMenuCommandInteraction,
    InteractionResponse,
    Message,
    MessageComponentInteraction,
} from "discord.js";
import { InteractionConditionType } from "./InteractionConditions";

export interface PreconditionOptions extends AllFlowsPrecondition.Options {
    id: string;
    failedMessage: string;
}

export abstract class Precondition extends AllFlowsPrecondition {
    public id: string;
    public failedMessage: string;

    constructor(context: Piece.Context, options: PreconditionOptions) {
        super(context, options);
        this.id = options.id;
        this.failedMessage = options.failedMessage;

        // If options contains order then we know the condition type;
        if (typeof options.position === "number") {
            this.container.client.interactionConditions.addPrecondition({
                key: this.id,
                type: InteractionConditionType.Global,
                precondition: this,
                order: options.position,
            });
        } else {
            this.container.client.interactionConditions.addPrecondition({
                key: this.id,
                type: InteractionConditionType.Manual,
                precondition: this,
            });
        }
    }

    abstract isValid(
        interaction:
            | Message
            | CommandInteraction
            | ContextMenuCommandInteraction
            | MessageComponentInteraction
    ): boolean;

    public hasFailed<T extends Function | undefined>(
        interaction: CommandInteraction | MessageComponentInteraction,
        callback?: T
    ): ReturnTypeOr<
        T,
        Promise<Message<boolean> | InteractionResponse<boolean>>
    > {
        let reply;
        if (interaction.deferred || interaction.replied) {
            reply = interaction.editReply({
                content: this.failedMessage,
            });
        }
        reply = interaction.reply({
            content: this.failedMessage,
            ephemeral: true,
        });
        return callback ? callback() : reply;
    }

    private async check(
        interaction:
            | Message
            | CommandInteraction
            | ContextMenuCommandInteraction
    ) {
        if (this.isValid(interaction)) {
            return this.ok();
        }
        return this.error({ identifier: this.id });
    }

    public override async messageRun(message: Message) {
        return this.check(message);
    }

    public override async chatInputRun(interaction: CommandInteraction) {
        return this.check(interaction);
    }

    public override async contextMenuRun(
        interaction: ContextMenuCommandInteraction
    ) {
        return this.check(interaction);
    }
}
