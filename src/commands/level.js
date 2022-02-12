const { SlashCommandBuilder } = require('@discordjs/builders');
const { GuildUser } = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { getXpNeeded } = require('../utils/levelUtils');
const { reply } = require('../utils/messages');
const translationManager = require('../translations/translationsManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('See your or someone elses current level')
    .addUserOption((options) => options.setName('user')
      .setDescription('The user you want to check the level of')
      .setRequired(false)),
  async execute(interaction) {
    const translations = await translationManager.get(interaction.guild.id, interaction.client);
    try {
      if (interaction.options.getUser('user') == null) {
        const guildUser = await GuildUser.findOne({
          where: {
            userId: interaction.member.id,
            guildId: interaction.guild.id,
          },
        });
        if (guildUser == null) {
          await reply(interaction, translations.command.level.not_spoken_yet, true);
          return;
        }
        await reply(
          interaction,
          translationManager.format(
            translations.commands.level.your_current_level,
            [['level', guildUser.level], ['xp', getXpNeeded(guildUser.level + 1) - guildUser.xp]],
          ),
          false,
        );
      } else {
        const user = interaction.options.getUser('user');
        const guildUser = await GuildUser.findOne({ where: { userId: interaction.options.getUser('user').id, guildId: interaction.guild.id } });
        if (guildUser == null) {
          await reply(
            interaction,
            translationManager.format(
              translations.commands.level.user_not_spoken_yet,
              [['user', `${user.username}#${user.discriminator}`]],
            ),
            true,
          );
          return;
        }
        await reply(
          interaction,
          translationManager.format(
            translations.commands.level.user_current_level,
            [['user', `${user.username}#${user.discriminator}`], ['level', guildUser.level], ['xp', getXpNeeded(guildUser.level + 1) - guildUser.xp]],
          ),
          false,
        );
      }
    } catch (e) {
      Sentry.setTag('guild_id', interaction.guild.id);
      Sentry.setTag('bot_id', interaction.applicationId);
      const errorCode = Sentry.captureException(e);
      await reply(
        interaction,
        translationManager.format(
          translations.generic.error,
          [['error_code', errorCode]],
        ),
        true,
      );
    }
  },
};
