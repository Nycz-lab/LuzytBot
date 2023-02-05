const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');


const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, AudioResource, createAudioResource , AudioPlayerStatus} = require('@discordjs/voice');

const play = require('play-dl')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("plays music")
        .addStringOption(option =>
            option.setName("name")
                .setDescription("URL or Query Name for the Video on YouTube!")
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.voice?.channel) return interaction.channel.send('Connect to a Voice Channel')


        const target = interaction.options.getString('name');

        console.log(target);

        const channelId = interaction.member.voice.channel.id;
        const guildId = interaction.guild.id;

        console.log(`Joining channel: ${interaction.member.voice.channel.name} on guild: ${interaction.guild.name}`);
        const conn = joinVoiceChannel({
            channelId: channelId,
            guildId: guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator
        })

        const format = await play.validate(target);


        let yt_info = undefined;

        if (format === "yt_video") {
            yt_info = await play.video_info(target);
        } else {
            let searchResults = await play.search(target);
            yt_info = await play.video_info(searchResults[0].url);
        }

        console.log(`playing ${yt_info.video_details.title}`);
        let stream = await play.stream_from_info(yt_info);

        let audio_resource = createAudioResource(stream.stream, { inputType: stream.type });
        let audio_player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        });

        audio_player.

        //play.attachListeners(audio_player, stream);

        audio_player.on(AudioPlayerStatus.Paused, () => {
            console.log("paused");
        })

        audio_player.on(AudioPlayerStatus.AutoPaused, () => {
            console.log("auto paused");
        })

        audio_player.once(AudioPlayerStatus.Idle, async () => {
            console.log("idle");
            conn.disconnect();

            await interaction.channel.send("disconnected due to queue being empty!");   // change this so the embed gets updated instead
        })

        audio_player.play(audio_resource);
        conn.subscribe(audio_player);

        
        const infoEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Luzyt MusicPlayer')
            .setURL('https://github.com/Nycz-lab')
            .setAuthor({ name: 'Nycz', iconURL: 'https://github.com/Nycz-lab.png', url: 'https://github.com/Nycz-lab' })
            .setDescription('A simple discord bot made out of pure boredom')
            .setThumbnail('https://github.com/Nycz-lab.png')
            // .addFields(
            //     { name: 'Regular field title', value: 'Some value here' },
            //     { name: '\u200B', value: '\u200B' },
            //     { name: 'Inline field title', value: 'Some value here', inline: true },
            //     { name: 'Inline field title', value: 'Some value here', inline: true },
            // )
            // .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
            .setImage(yt_info.video_details.thumbnails[yt_info.video_details.thumbnails.length - 1].url)
            .setTimestamp()
            .setFooter({ text: 'Nycz#3421', iconURL: 'https://cdn.discordapp.com/avatars/172978817462173696/36c215d8ffc3f476df12b376f9d792fd.webp?size=128' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('pause')
                    .setLabel('⏸')
                    .setStyle(ButtonStyle.Primary),
            ).addComponents(
                new ButtonBuilder()
                    .setCustomId('play')
                    .setLabel('▶')
                    .setStyle(ButtonStyle.Primary),
            ).addComponents(
                new ButtonBuilder()
                    .setCustomId('stop')
                    .setLabel('⏹')
                    .setStyle(ButtonStyle.Primary),
            );

        const collector = interaction.channel.createMessageComponentCollector();

        collector.on('collect', async i => {
            if(i.customId === 'stop'){
                audio_player.stop();
                conn.disconnect();
    
                await i.update({ content: 'The session has ended!', embeds: [], components: [] });
            }else if(i.customId === 'pause'){
                audio_player.pause();
                await i.update({});
            }else if(i.customId === 'play'){
                audio_player.unpause();
                await i.update({});
            }
            
        });

        collector.on('end', collected => console.log(`Collected ${collected.size} items`));

        await interaction.reply({ embeds: [infoEmbed], components: [row], ephemeral: true });

    }
}