const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("get information about the bot"),
    async execute(interaction) {

        const infoEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Luzyt Info')
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
            .setImage('https://github.com/Nycz-lab.png')
            .setTimestamp()
            .setFooter({ text: 'Nycz#3421', iconURL: 'https://cdn.discordapp.com/avatars/172978817462173696/36c215d8ffc3f476df12b376f9d792fd.webp?size=128' });

        await interaction.reply({ embeds: [infoEmbed] });
    }
}