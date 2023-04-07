import mongoose from "mongoose";

const GuildSchema = new mongoose.Schema(
    {
        guildID: {
            type: String,
            required: true,
            unique: true,
            immutable: true,
        },
        prefix: { type: String, default: process.env.PREFIX },
    },
    { autoCreate: true, timestamps: true }
);

export default GuildSchema;
