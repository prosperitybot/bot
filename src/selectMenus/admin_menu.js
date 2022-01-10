const deploy = require('../deploy-commands');
const { reply } = require('../utils/messages');

module.exports = {
	name: 'admin_menu',
	async execute(interaction) {
		switch (interaction.values[0]) {
		case 'admin_deploy_commands':
			deploy();
			await reply(interaction, 'Deployed Commands Successfully', true);
			break;
		}
	},
};