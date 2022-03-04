import { Client } from 'discord.js';
import { LogClientError } from '../managers/ErrorManager';
import Commands from '../managers/CommandManager';

import { Event } from '../typings/Event';

const ReadyEvent: Event = {
  name: 'ready',
  type: 'on',
  on: async (client: Client) => {
    try {
      console.log(`Logged in as ${client.user?.username}#${client.user?.discriminator}`);
      await client.application?.commands.set(Commands);
    } catch (e) {
      await LogClientError(e, client);
    }
  },
};

export default ReadyEvent;
