/* eslint-disable no-param-reassign */
require('dotenv').config();
const Sentry = require('@sentry/node');
const { WhitelabelBot, setup: setupDatabase } = require('@prosperitybot/database');
const { Op } = require('sequelize');
const { login } = require('./bot');
const { sqlLogger } = require('./utils/loggingUtils');
const clients = require('./clientManager');

setupDatabase(sqlLogger);

if (process.env.SENTRY_DSN !== '') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

WhitelabelBot.findAll({ where: { last_action: { [Op.in]: ['start', 'restart'] } } }).then((whitelabelBots) => {
  whitelabelBots.forEach((bot) => { clients.addClient(bot.botId, login(bot.botId, bot.token)); });
});

clients.addClient(process.env.CLIENT_ID, login(process.env.CLIENT_ID, process.env.DISCORD_TOKEN));

setInterval(async () => {
  const botsToStart = await WhitelabelBot.findAll({ where: { action: { [Op.ne]: null } } });
  botsToStart.forEach(async (bot) => {
    switch (bot.action) {
      case 'restart':
        clients.getClient(bot.oldBotId ?? bot.botId).destroy();
        clients.removeClient(bot.oldBotId ?? bot.botId);
        clients.addClient(bot.botId, login(bot.botId, bot.token));
        break;
      case 'start':
        if (bot.oldBotId != null) {
          clients.getClient(bot.oldBotId).destroy();
        }
        clients.removeClient(bot.oldBotId ?? bot.botId);
        clients.addClient(bot.botId, login(bot.botId, bot.token));
        break;
      case 'stop':
        clients.getClient(bot.botId).destroy();
        break;
      default:
        break;
    }
    bot.botId = bot.oldBotId ?? bot.botId;
    bot.oldBotId = null;
    bot.last_action = bot.action;
    bot.action = null;
    await bot.save();
  });
}, 5000);

process.on('SIGINT', () => {
  console.log('Shutting down nicely...');
  clients.getAllClients().forEach((client) => client.destroy());
  process.exit();
});
