import {
    Events,
    Listener,
    type ChatInputCommandDeniedPayload,
    type UserError,
} from "@sapphire/framework";
import { CommandErrors } from "../";

// Types
import type { GlobalPrecondition } from "../utils/preconditions";

export class ChatInputCommandDenied extends Listener<
    typeof Events.ChatInputCommandDenied
> {
    public async run(
        error: UserError,
        { interaction }: ChatInputCommandDeniedPayload
    ) {
        if (Object.values(CommandErrors).includes(error.identifier)) {
            const precondition = this.container.stores
                .get("preconditions")
                .get(error.identifier);
            // Using the identifier for an error we are going to attempt to dynamically find and execute the hasFailed function
            if (precondition) {
                // Determine if the precondition is global
                if (typeof precondition.position === "number") {
                    try {
                        // Dynamically import the precondition
                        const module = await import(precondition.location.full);
                        const classInstance: GlobalPrecondition | undefined =
                            module[`${error.identifier}Precondition`];
                        if (classInstance?.hasFailed) {
                            return classInstance.hasFailed(interaction);
                        }
                    } catch (err) {
                        // Don't handle the error, we will just divert to the default error message
                    }
                }
            }
        }

        return interaction.reply({
            content:
                error.message ||
                "An error occurred when executing that command",
            ephemeral: true,
        });
    }
}
