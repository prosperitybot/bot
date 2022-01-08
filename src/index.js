require('dotenv').config();
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Register Commands & Menus
client.commands = new Collection();
client.menus = new Collection();

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
const menuFiles = fs.readdirSync('./src/selectMenus').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

for (const file of menuFiles) {
	const menu = require(`./selectMenus/${file}`);
	client.menus.set(menu.name, menu);
}

const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.on('interactionCreate', async interaction => {
	try {
		if (interaction.isCommand()) {
			const command = client.commands.get(interaction.commandName);
			if (!command) return;

			await command.execute(interaction);
		}

		if (interaction.isSelectMenu()) {
			const menu = client.menus.get(interaction.customId);
			if (!menu) return;

			await menu.execute(interaction);
		}
		return;
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this interaction!', ephemeral: true });
	}
});

client.login(process.env.DISCORD_TOKEN);

process.on('SIGINT', function() {
	console.log('Shutting down nicely...');
	client.destroy();
	process.exit();
});