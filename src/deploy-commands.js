const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = () => {
	const commands = [];
	const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		commands.push(command.data.toJSON());
	}

	const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

	rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
		.then((data) => {
			console.log('Successfully registered application commands.');
			const cmds = data.map(c => ({ id: c.id, name: c.name }));
			console.log(cmds);
		})
		.catch(console.error);
};