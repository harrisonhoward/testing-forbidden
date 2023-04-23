import { Message } from "discord.js";

export const isMessage = (message?: Message | unknown): message is Message => {
    return !!(message as Message)?.author;
};
