import { Client, Intents } from 'discord.js';
import Commands from './commands';
import interactionEvent from './events/interactionEvent';

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

  interactionEvent(client);

  // Run Command Deployment

  client.login(token);

  return client;
};

export default Login;
