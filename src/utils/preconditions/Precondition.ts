import { AllFlowsPrecondition, container } from "@sapphire/framework";
import {
    CommandInteraction,
    ContextMenuCommandInteraction,
    Message,
    MessageComponentInteraction,
} from "discord.js";
import { Condition, InteractionConditionType } from "./InteractionConditions";
import { isMessage } from "../isMessage";
import { renderFailureEmbed } from "./FailureEmbed";

export type LoaderContext = AllFlowsPrecondition.LoaderContext;

export interface PreconditionOptions extends AllFlowsPrecondition.Options {
    onFailure?: string;
}

export abstract class Precondition extends AllFlowsPrecondition {
    public name: string;
    public onFailure: PreconditionOptions["onFailure"];

    constructor(context: LoaderContext, options: PreconditionOptions) {
        super(context, options);
        this.name = options.name || context.name;
        this.onFailure = options.onFailure;

        // If options contains order then we know the condition type;
        if (typeof options.position === "number") {
            container.client.interactionConditions.addPrecondition({
                key: this.name,
                type: InteractionConditionType.Global,
                precondition: this,
                order: options.position,
            });
        } else {
            container.client.interactionConditions.addPrecondition({
                key: this.name,
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
    ): boolean | Promise<boolean>;

    public hasFailed: Condition["hasFailed"] = (interaction, callback?) => {
        if (!this.onFailure) return;
        let reply;
        if (isMessage(interaction)) {
            reply = interaction.reply({
                embeds: [renderFailureEmbed(interaction, this.onFailure)],
            });
        } else if (interaction.deferred || interaction.replied) {
            reply = interaction.editReply({
                content: this.onFailure,
            });
        } else {
            reply = interaction.reply({
                content: this.onFailure,
                ephemeral: true,
            });
        }
        return callback ? callback() : reply;
    };

    private async check(
        interaction:
            | Message
            | CommandInteraction
            | ContextMenuCommandInteraction
    ) {
        if ((await this.isValid(interaction)) === true) {
            return this.ok();
        }
        return this.error({ identifier: this.name });
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
