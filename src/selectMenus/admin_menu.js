const Sentry = require('@sentry/node');
const { deploy } = require('../deploy-commands');
const { reply } = require('../utils/messages');

module.exports = {
  name: 'admin_menu',
  async execute(interaction) {
    switch (interaction.values[0]) {
      case 'admin_deploy_commands':
        try {
          deploy(interaction.client.application.id, process.env.DISCORD_TOKEN);
          await reply(interaction, 'Deployed Commands Successfully', true);
          break;
        } catch (e) {
          Sentry.captureException(e);
        }
        break;
      default:
        break;
    }
  },
};
