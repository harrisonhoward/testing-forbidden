import {
    BaseMessageOptions,
    ChatInputCommandInteraction,
    InteractionResponse,
    Message,
    MessageComponentInteraction,
} from "discord.js";
import { isMessageComponentInteraction } from "../isMessageComponentInteraction";

/**
 * This util will defer the reply only when it is able to.
 *
 * @param interaction
 */
export async function autoDeferReply(
    interaction: ChatInputCommandInteraction | MessageComponentInteraction
) {
    const fromMessageComponent = isMessageComponentInteraction(interaction);
    // Defer the ineraction if it hasn't already been (command interaction)
    if (
        !fromMessageComponent &&
        !interaction.deferred &&
        !interaction.replied
    ) {
        await interaction.deferReply();
    }
}

export async function sendDeferredResponse(
    interaction: ChatInputCommandInteraction | MessageComponentInteraction,
    options?: BaseMessageOptions
): Promise<InteractionResponse<boolean> | Message<boolean>> {
    const { content, embeds, components } = options ?? {};
    // Response to the interaction
    const responseObj: BaseMessageOptions = {
        content: content ?? "",
        embeds,
        components,
    };
    const fromMessageComponent = isMessageComponentInteraction(interaction);
    // A button interaction cause this function to be called
    if (fromMessageComponent && !interaction.replied) {
        return interaction.update(responseObj);
    }
    // A command interaction cause this function to be called
    return interaction.editReply(responseObj);
}
