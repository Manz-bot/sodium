import { MessageFlags, SlashCommandBuilder } from "discord.js";

import type { GuildMember } from "discord.js";
import type { Command } from "../../Utils/types/Client";

export default {
    apis: ['ENABLE_LAVALINK'],
    data: new SlashCommandBuilder()
        .setName("stopplaying").setDescription("Stops the player without leaving")
        .addBooleanOption(o => o.setName("clear_queue").setDescription("Should the queue be cleared? (default true)").setRequired(false))
        .addBooleanOption(o => o.setName("execute_autoplay").setDescription("Should autoplay function be executed? (default false)").setRequired(false)),
    cooldown: 5,
    category: 'Music',
    guildOnly: true,
    execute: async (client, interaction) => {
        if(!interaction.guildId) return;

        const vcId = (interaction.member as GuildMember)?.voice?.channelId;
        if (!vcId) return interaction.reply({ flags: [MessageFlags.Ephemeral], content: "Join a Voice Channel " });

        const player = client.lavalink.getPlayer(interaction.guildId);
        if (!player) return interaction.reply({ flags: [MessageFlags.Ephemeral], content: "I'm not connected" });
        if (player.voiceChannelId !== vcId) return interaction.reply({ flags: [MessageFlags.Ephemeral], content: "You need to be in my Voice Channel" })

        await player.stopPlaying(interaction.options?.getBoolean?.("clear_queue") ?? true, interaction.options?.getBoolean?.("execute_autoplay") ?? false);

        interaction.reply({ content: "Stopped the player without leaving" });
    }
} as Command;
