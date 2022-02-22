import 'dotenv/config';
import * as Sentry from '@sentry/node';
import * as fs from 'fs';
import { Client } from 'discord.js';
import { Op } from 'sequelize';
import { WhitelabelBot, setup as SetupDatabase } from '@prosperitybot/database';
import Bot from './bot';
import { SqlLogger } from './utils/loggingUtils';
import {
  AddClient, GetAllClients, GetClient, RemoveClient,
} from './managers/ClientManager';
import { SetupTranslation } from './managers/TranslationManager';

SetupDatabase(SqlLogger);

if (process.env.SENTRY_DSN !== '') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

async function start() {
  // WhitelabelBot.findAll({ where: { last_action: { [Op.in]: ['start', 'restart'] } } }).then((whitelabelBots) => {
  //   whitelabelBots.forEach(async (bot) => {
  //     Clients[bot.botId] = await Bot(bot.botId, bot.token);
  //   });
  // });

  const mainBot: Client = await Bot(process.env.CLIENT_ID!, process.env.DISCORD_TOKEN!);
  AddClient(process.env.CLIENT_ID!, mainBot);
}

const translationFiles = fs.readdirSync('./translations').filter((file) => file.endsWith('.json'));
translationFiles.forEach((file) => {
  SetupTranslation(file.replace('.json', ''));
});

start();

setInterval(async () => {
  const BotsWithActions: WhitelabelBot[] = await WhitelabelBot.findAll({ where: { action: { [Op.ne]: null } } });
  BotsWithActions.forEach(async (bot) => {
    switch (bot.action) {
      case 'restart':
        GetClient(bot.oldBotId ?? bot.botId).destroy();
        RemoveClient(bot.oldBotId ?? bot.botId);
        AddClient(bot.botId, await Bot(bot.botId, bot.token));
        break;
      case 'start':
        if (bot.oldBotId != null) {
          GetClient(bot.oldBotId).destroy();
        }
        RemoveClient(bot.oldBotId ?? bot.botId);
        AddClient(bot.botId, await Bot(bot.botId, bot.token));
        break;
      case 'stop':
        GetClient(bot.botId).destroy();
        RemoveClient(bot.botId);
        break;
      default:
        break;
    }
  });
}, 5000);

process.on('SIGINT', () => {
  console.log('Shutting down all clients...');
  GetAllClients().forEach((client) => {
    console.log(`Shutting down ${client.user?.username}#${client.user?.discriminator}`);
    client.destroy();
  });
  process.exit();
});
