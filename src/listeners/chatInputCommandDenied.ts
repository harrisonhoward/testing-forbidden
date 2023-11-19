import {
    Events,
    Listener,
    type ChatInputCommandDeniedPayload,
    type UserError,
    container,
} from "@sapphire/framework";

export class ChatInputCommandDenied extends Listener<
    typeof Events.ChatInputCommandDenied
> {
    public async run(
        error: UserError,
        { interaction }: ChatInputCommandDeniedPayload
    ) {
        const condition =
            container.client.interactionConditions.conditions.find(
                (condition) => condition.key === error.identifier
            );
        if (condition) {
            return condition.precondition.hasFailed(interaction);
        }

        return interaction.reply({
            content:
                error.message ||
                "An error occurred when executing that command",
            ephemeral: true,
        });
    }
}
