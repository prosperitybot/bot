import { Client, Intents } from 'discord.js';
import { WhitelabelBot } from '@prosperitybot/database';
import Events from './managers/EventManager';

const Login = async (token: string): Promise<Client> => {
  const client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MEMBERS,
    ],
  });

  Events.forEach((event) => {
    if (event.type === 'once') {
      client.once(event.name, (...args: any[]) => event.on(client, args));
    } else {
      client.on(event.name, (...args: any[]) => event.on(client, args));
    }
  });

  client.login(token);

  client.on('ready', async () => {
    const bot = await WhitelabelBot.findOne({ where: { botId: client.user?.id } });
    if (bot != null) {
      bot.botName = client.user?.username;
      bot.botDiscrim = client.user?.discriminator;
      bot.botAvatarHash = client.user?.avatar;
      await bot.save();
    }
  });

  return client;
};

export default Login;
