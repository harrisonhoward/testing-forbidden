import {
    Events,
    Listener,
    type MessageCommandDeniedPayload,
    type UserError,
} from "@sapphire/framework";

export class MessageCommandDenied extends Listener<
    typeof Events.MessageCommandDenied
> {
    public async run(
        error: UserError,
        { message }: MessageCommandDeniedPayload
    ) {
        const condition =
            this.container.client.interactionConditions.conditions.find(
                (condition) => condition.key === error.identifier
            );
        if (condition) {
            return condition.precondition.hasFailed(message);
        }

        return message.reply({
            content:
                error.message ||
                "An error occurred when executing that command",
        });
    }
}
