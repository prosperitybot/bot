const { Guild, User, GuildUser, migrate } = require('../database/database');
module.exports = {
	name: 'db_admin_menu',
	async execute(interaction) {
		switch (interaction.values[0]) {
		case 'db_run_migrations':
			migrate();
			interaction.reply({ content: 'Migrations Ran Successfully', ephemeral: true });
			break;
		case 'db_run_migrations_force':
			migrate(true);
			interaction.reply({ content: 'Database cleared & Migrations Ran', ephemeral: true });
			break;
		case 'db_seed':
			await interaction.reply({ content: 'Seeding database, this may take a while', ephemeral: true });
			try {
				interaction.client.guilds.cache.forEach(async guild => {
					const g = await Guild.findByPk(guild.id);
					if (g == null) {
						await Guild.create({
							id: guild.id,
							name: guild.name,
							premium: false,
						});
						console.log(`Added guild #${guild.id} (${guild.name})`);
						guild.members.cache.forEach(async member => {
							const u = await User.findByPk(member.id);
							if (u == null) {
								await User.upsert({ id: member.id });
								await GuildUser.create({
									userId: member.id,
									guildId: guild.id,
									level: 1,
									xp: 0,
								});
								console.log(`Added user #${member.id} (${member.displayName})`);
							}
						});
					}
				});
				await interaction.editReply({ content: 'Database Seeded', ephemeral: true });
			}
			catch (e) {
				console.error(e);
				await interaction.reply({ content: 'There was an error while executing this interaction!', ephemeral: true });
			}
			break;
		}
	},
};