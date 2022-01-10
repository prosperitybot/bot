const { MessageEmbed } = require('discord.js');

module.exports = {
	reply: async (interaction, message, ephemeral = false, components = null) => {
		const e = embed().setDescription(message);
		await interaction.reply({ embeds: [e], ephemeral: ephemeral, components: components });
	},
	send: async (channel, message) => {
		const e = embed().setDescription(message);
		await channel.send({ embeds: [e] });
	},
	editReply: async (interaction, message, ephemeral = false, components = null) => {
		const e = embed().setDescription(message);
		await interaction.editReply({ embeds: [e], ephemeral: ephemeral, components: components });
	},
};

function embed() {
	return new MessageEmbed()
		.setColor('#0099ff')
		.setAuthor({ name: 'Aequum', url: 'https://aequum.info' });
}