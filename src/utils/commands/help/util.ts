import { Command } from "@sapphire/framework";
import {
    ChatInputCommandInteraction,
    Client,
    MessageComponentInteraction,
} from "discord.js";

import { CommandGroup, Group, REGISTERED_GROUPS } from "./store";
import { filterAsync } from "../../arrayUtil";

export function getCommands(bot: Client): Command[] {
    return bot.stores.get("commands").map((command) => command);
}

export function getGroups(
    bot: Client,
    interaction: ChatInputCommandInteraction | MessageComponentInteraction
): Promise<Group[]> {
    return filterAsync(REGISTERED_GROUPS, async (group) => {
        // No preconditions then continue
        if (!Array.isArray(group.preconditions)) return true;
        // Make sure all preconditions pass
        if (
            await bot.interactionConditions.checkPreconditions(
                interaction,
                group.preconditions
            )
        )
            return true;
        return false;
    });
}

export async function getCommandsByGroup(
    bot: Client,
    interaction: ChatInputCommandInteraction | MessageComponentInteraction
): Promise<CommandGroup[]> {
    const commands = getCommands(bot);
    const groups = await getGroups(bot, interaction);
    return groups.map((group) => ({
        group,
        commands: commands.filter(
            (command) => command.fullCategory[0] === group.name
        ),
    }));
}
