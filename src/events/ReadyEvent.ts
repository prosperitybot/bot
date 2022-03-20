import { Client } from 'discord.js';
import { WhitelabelBot } from '@prosperitybot/database';
import { ActivityTypes } from 'discord.js/typings/enums';
import { LogClientError } from '../managers/ErrorManager';
import Commands from '../managers/CommandManager';
import { Event } from '../typings/Event';
import { IsWhitelabel } from '../managers/ClientManager';

const ReadyEvent: Event = {
  name: 'ready',
  type: 'on',
  on: async (client: Client) => {
    try {
      // eslint-disable-next-line no-console
      console.log(`Logged in as ${client.user?.username}#${client.user?.discriminator}`);
      await client.application?.commands.set(Commands.map((c) => c.data));
      if (IsWhitelabel(client)) {
        const wlBot: WhitelabelBot = await WhitelabelBot.findOne({ where: { botId: client.application?.id } });
        client.user?.setActivity({ name: wlBot.statusContent, type: wlBot.statusType });
      } else {
        client.user?.setActivity({ name: '/about', type: ActivityTypes.LISTENING });
      }
    } catch (e) {
      await LogClientError(e, client);
    }
  },
};

export default ReadyEvent;
