import type { Command } from "@sapphire/framework";

export const REGISTERED_GROUPS: Group[] = [
    {
        name: "Basic",
        emoji: "📜",
    },
    {
        name: "Information",
        emoji: "🇮",
    },
    {
        name: "Founder",
        emoji: "👑",
        preconditions: ["ManagerOnly"],
    },
    {
        name: "Staff",
        emoji: "🛡️",
        preconditions: ["StaffOnly"],
    },
];

export interface CommandGroup {
    group: Group;
    commands: Command[];
}

export interface Group {
    name: string;
    emoji: string;
    preconditions?: string[];
}
