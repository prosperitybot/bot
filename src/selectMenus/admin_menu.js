const deploy = require('../deploy-commands');
module.exports = {
	name: 'admin_menu',
	async execute(interaction) {
		switch (interaction.values[0]) {
		case 'admin_deploy_commands':
			deploy();
			await interaction.reply({ content: 'Deployed Commands Successfully', ephemeral: true });
			break;
		}
	},
};