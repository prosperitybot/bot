import { ButtonInteraction } from 'discord.js';
import { WhitelabelBot } from '@prosperitybot/database';
import { LogInteractionError } from '../managers/ErrorManager';
import { ButtonList } from '../typings/ButtonList';
import { ReplyToInteraction } from '../managers/MessageManager';

const WhitelabelButtonList: ButtonList = {
  name: 'whitelabel',
  needsAccessLevel: ['WHITELABEL'],
  needsPermissions: [],
  execute: async (interaction: ButtonInteraction) => {
    try {
      const bot = await WhitelabelBot.findOne({ where: { userId: interaction.user.id } });
      switch (interaction.customId) {
        case 'whitelabel-bot_start':
          bot.action = 'start';
          await bot.save();
          await ReplyToInteraction(interaction, 'Bot Started, it may take a few seconds to appear.', true);
          break;
        case 'whitelabel-bot_restart':
          bot.action = 'restart';
          await bot.save();
          await ReplyToInteraction(interaction, 'Bot Restarted, it may take a few seconds to appear.', true);
          break;
        case 'whitelabel-bot_stop':
          bot.action = 'stop';
          await bot.save();
          await ReplyToInteraction(interaction, 'Bot Stopped, it may take a few seconds to process.', true);
          break;
        default:
          break;
      }
    } catch (e) {
      await LogInteractionError(e, interaction);
    }
  },
};

export default WhitelabelButtonList;
