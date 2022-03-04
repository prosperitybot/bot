import { Client, Intents } from 'discord.js';
import Commands from './managers/CommandManager';
import Events from './managers/EventManager';
import InteractionEvent from './events/InteractionEvent';

const Login = async (botId: string, token: string): Promise<Client> => {
  const client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
    ],
  });

  client.on('ready', async () => {
    console.log(`Logged in as ${client.user?.username}#${client.user?.discriminator}`);
    await client.application?.commands.set(Commands);
  });

  Events.forEach((event) => {
    if (event.type === 'once') {
      client.once(event.name, (...args: any[]) => event.on(client, args));
    } else {
      client.on(event.name, (...args: any[]) => event.on(client, args));
    }
  });

  InteractionEvent(client);

  // Run Command Deployment

  client.login(token);

  return client;
};

export default Login;
