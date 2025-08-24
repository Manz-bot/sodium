import { MessageFlags, SlashCommandBuilder } from "discord.js";

import type { GuildMember } from "discord.js";
import type { Command } from "../../Utils/types/Client";

export default {
    apis: ['ENABLE_LAVALINK'],
    data: new SlashCommandBuilder()
        .setName("resume_with_fix").setDescription("Resume the player with the playback fix"),
    cooldown: 5,
    category: 'Music',
    guildOnly: true,
    execute: async (client, interaction) => {
        if (!interaction.guildId) return;

        const vcId = (interaction.member as GuildMember)?.voice?.channelId;
        if (!vcId) return interaction.reply({ flags: [MessageFlags.Ephemeral], content: "Join a Voice Channel " });

        const player = client.lavalink.getPlayer(interaction.guildId);
        if (!player) return interaction.reply({ flags: [MessageFlags.Ephemeral], content: "I'm not connected" });

        if (player.voiceChannelId !== vcId) return interaction.reply({ flags: [MessageFlags.Ephemeral], content: "You need to be in my Voice Channel" })

        if (!player.paused) return interaction.reply({ flags: [MessageFlags.Ephemeral], content: "Not paused" })

        if (!player.queue.current) {
            await player.resume();
            await interaction.reply({
                flags: [MessageFlags.Ephemeral], content: `Resumed the player (without fix because tehre is no current)`
            });
            return
        }

        // to fix the "song get's skipped on unpause", we need to re-play the current song but on the same position to create a new playback stream
        // the issue happens wshen you pause for a too long duration
        // you can add handlings, like if pause-duration < 30s return player.resume();
        // to get pause duration you can intruduce a custom variavble like player.set("custom_pause_timestamp", Date.now()) -> player.get("custom_pause_timestamp")
        return await player.play({
            track: {
                encoded: player.queue.current.encoded,
                requester: player.queue.current.requester,
                userData: {
                    ...(player.queue.current.userData || {}), // pass previous userData or empty object
                    resumeSkipFix: "true",
                },
            },
            paused: false,
            position: player.lastPosition,
            noReplace: false
        });

    }
} as Command;
