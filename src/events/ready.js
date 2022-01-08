module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		const command = await client.guilds.cache.get('700059392770441216')?.commands.fetch('929303455779139604');
		const permissions = [
			{
				id: '126429064218017802',
				type: 'USER',
				permission: true,
			},
		];

		await command.permissions.add({ permissions });
	},
};