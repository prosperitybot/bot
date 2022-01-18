require('dotenv').config();
const Sentry = require('@sentry/node');
const { login } = require('./bot');
const { WhitelabelBot } = require('./database/database');

const clients = [];

if (process.env.SENTRY_DSN != '') {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		tracesSampleRate: 1.0,
	});
}

WhitelabelBot.findAll().then(whitelabelBots => {
	whitelabelBots.forEach(bot => clients[bot.botId] = login(bot.botId, bot.token));
});

clients[process.env.CLIENT_ID] = login(process.env.CLIENT_ID, process.env.DISCORD_TOKEN);

setInterval(async () => {
	const botsToStart = await WhitelabelBot.findAll({ where: { changeNoticed: false } });
	botsToStart.forEach(async bot => {
		if (bot.oldBotId != null) {
			clients[bot.oldBotId].destroy();
		}
		clients[bot.botId] = login(bot.botId, bot.token);
		bot.changeNoticed = true;
		await bot.save();
	});
}, 5000);

process.on('SIGINT', function() {
	console.log('Shutting down nicely...');
	clients.forEach(client => client.destroy());
	process.exit();
});