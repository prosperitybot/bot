import { Client, Intents } from 'discord.js';
import Events from './managers/EventManager';

const Login = async (botId: string, token: string): Promise<Client> => {
  const client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
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

  return client;
};

export default Login;
