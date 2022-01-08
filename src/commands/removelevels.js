const { SlashCommandBuilder } = require('@discordjs/builders');
const { GuildUser } = require('../database/database');
const { getXpNeeded } = require('../utils/levelUtils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removelevels')
		.setDescription('Removes levels from a user')
		.addUserOption(options =>
			options.setName('user')
				.setDescription('The user you want to take levels from')
				.setRequired(true),
		)
		.addIntegerOption(options =>
			options.setName('amount')
				.setDescription('The amount of levels to take')
				.setRequired(true),
		),
	async execute(interaction) {
		if (!interaction.member.permissions.has('ADMINISTRATOR')) {
			await interaction.reply({ content: 'Access Denied', ephemeral: true });
			return;
		}
		try {
			const user = interaction.options.getUser('user');
			const guildUser = await GuildUser.findOne({ where: { userId: user.id, guildId: interaction.guild.id } });
			const amount = interaction.options.getInteger('amount');

			if (amount <= 0) {
				await interaction.reply({ content: 'Levels to take must be a positive number', ephemeral: true });
				return;
			}

			guildUser.level -= amount;
			guildUser.xp = getXpNeeded(guildUser.level);

			await guildUser.save();
			await interaction.reply({ content: `Taken ${amount} level${amount > 1 ? 's' : ''} from ${user.username}#${user.discriminator}` });
		}
		catch (e) {
			console.error(e);
		}
	},
};
