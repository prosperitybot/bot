const Sentry = require('@sentry/node');
const { WhitelabelBot, User } = require('@prosperitybot/database');
const permissions = require('../utils/permissionUtils');
const { reply } = require('../utils/messages');

module.exports = {
  name: 'whitelabel',
  async execute(interaction) {
    const user = await User.findByPk(interaction.member.id);
    if (!permissions.hasAccessLevel(user, 'WHITELABEL')) {
      await reply(interaction, 'Access Denied - You need to have whitelabel for this', true);
      return;
    }
    try {
      switch (interaction.customId) {
        case 'whitelabel-bot_start': {
          const bot = await WhitelabelBot.findOne({ where: { userId: interaction.member.id } });
          bot.action = 'start';
          await bot.save();
          await reply(interaction, 'Bot Started, it may take a few seconds to appear.', true);
          break;
        }
        case 'whitelabel-bot_restart': {
          const bot = await WhitelabelBot.findOne({ where: { userId: interaction.member.id } });
          bot.action = 'restart';
          await bot.save();
          await reply(interaction, 'Bot Restarted, it may take a few seconds to appear.', true);
          break;
        }
        case 'whitelabel-bot_stop': {
          const bot = await WhitelabelBot.findOne({ where: { userId: interaction.member.id } });
          bot.action = 'stop';
          await bot.save();
          await reply(interaction, 'Bot Stopped, it may take a few seconds to process.', true);
          break;
        }
        default:
          break;
      }
    } catch (e) {
      Sentry.captureException(e);
    }
  },
};
