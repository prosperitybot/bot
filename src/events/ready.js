const deploy = require('../deploy-commands');
module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		if (process.env.ADMIN_COMMAND_ID == '') {
			deploy();
		}
		else {
			const command = await client.application?.commands.fetch(process.env.ADMIN_COMMAND_ID);
			const permissions = [
				{
					id: '126429064218017802',
					type: 'USER',
					permission: true,
				},
			];
			await command.permissions.add({ permissions });
		}

	},
};