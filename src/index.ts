import 'dotenv/config';
import * as Sentry from '@sentry/node';
import { Client } from 'discord.js';
import { Op } from 'sequelize';
import { WhitelabelBot, setup as SetupDatabase } from '@prosperitybot/database';
import Bot from './bot';
import { SqlLogger } from './utils/loggingUtils';

SetupDatabase(SqlLogger);

if (process.env.SENTRY_DSN !== '') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}
const Clients: Client[] = [];

async function start() {
  // WhitelabelBot.findAll({ where: { last_action: { [Op.in]: ['start', 'restart'] } } }).then((whitelabelBots) => {
  //   whitelabelBots.forEach(async (bot) => {
  //     Clients[bot.botId] = await Bot(bot.botId, bot.token);
  //   });
  // });

  const mainBot: Client = await Bot(process.env.CLIENT_ID!, process.env.DISCORD_TOKEN!);
  Clients[process.env.CLIENT_ID!] = mainBot;
}

start();

setInterval(async () => {
  const BotsWithActions: WhitelabelBot[] = await WhitelabelBot.findAll({ where: { action: { [Op.ne]: null } } });
  BotsWithActions.forEach(async (bot) => {
    switch (bot.action) {
      case 'restart':
        Clients[bot.oldBotId ?? bot.botId].destroy();
        delete Clients[bot.oldBotId ?? bot.botId];
        Clients[bot.botId] = await Bot(bot.botId, bot.token);
        break;
      case 'start':
        if (bot.oldBotId != null) {
          Clients[bot.oldBotId].destroy();
        }
        delete Clients[bot.oldBotId ?? bot.botId];
        Clients[bot.botId] = await Bot(bot.botId, bot.token);
        break;
      case 'stop':
        Clients[bot.botId].destroy();
        delete Clients[bot.botId];
        break;
      default:
        break;
    }
  });
}, 5000);

process.on('SIGINT', () => {
  console.log('Shutting down all clients...');
  Clients.forEach((client) => {
    console.log(`Shutting down ${client.user?.username}#${client.user?.discriminator}`);
    client.destroy();
  });
  process.exit();
});
