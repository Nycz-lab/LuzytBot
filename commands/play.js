const { SlashCommandBuilder } = require('discord.js');

const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, AudioResource, createAudioResource } = require('@discordjs/voice');

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

        console.log(format);
        console.log(typeof(format));

        let yt_info = undefined;

        if(format === "yt_video"){
            yt_info = await play.video_info(target);
        }else{
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

        audio_player.play(audio_resource);
        conn.subscribe(audio_player);

        await interaction.reply("Connected!");

    }
}