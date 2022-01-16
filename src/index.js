require('dotenv').config();
const Sentry = require('@sentry/node');
const deploy = require('./deploy-commands');
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
	whitelabelBots.forEach(bot => clients.push(login(bot.botId, bot.token)));
});

clients.push(login(process.env.CLIENT_ID, process.env.DISCORD_TOKEN));


deploy();
process.on('SIGINT', function() {
	console.log('Shutting down nicely...');
	clients.forEach(client => client.destroy());
	process.exit();
});