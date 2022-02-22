import { Client, Intents } from 'discord.js';
import Commands from './managers/CommandManager';
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

  InteractionEvent(client);

  // Run Command Deployment

  client.login(token);

  return client;
};

export default Login;
