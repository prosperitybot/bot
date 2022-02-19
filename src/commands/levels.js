const { SlashCommandBuilder } = require('@discordjs/builders');
const { GuildUser } = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { getXpNeeded } = require('../utils/levelUtils');
const { reply } = require('../utils/messages');
const permissions = require('../utils/permissionUtils');
const translationManager = require('../translations/translationsManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('levels')
    .setDescription('Provides commands to give/remove levels from a user')
    .addSubcommand((subCommand) => subCommand
      .setName('give')
      .setDescription('Gives levels to a user')
      .addUserOption((options) => options.setName('user')
        .setDescription('The user you want to give levels to')
        .setRequired(true))
      .addIntegerOption((options) => options.setName('amount')
        .setDescription('The amount of levels to give')
        .setRequired(true)))
    .addSubcommand((subCommand) => subCommand
      .setName('take')
      .setDescription('Takes levels from a user')
      .addUserOption((options) => options.setName('user')
        .setDescription('The user you want to take levels from')
        .setRequired(true))
      .addIntegerOption((options) => options.setName('amount')
        .setDescription('The amount of levels to take')
        .setRequired(true))),
  async execute(interaction) {
    const translations = await translationManager.getTranslations(interaction.user.id, interaction.guild.id, interaction.client);
    if (!permissions.has(interaction.member, 'ADMINISTRATOR')) {
      await reply(interaction, translations.generic.access_denied, true);
      return;
    }
    try {
      const user = interaction.options.getUser('user');
      const guildUser = await GuildUser.findOne({
        where: {
          userId: user.id, guildId: interaction.guild.id,
        },
      });
      const amount = interaction.options.getInteger('amount');
      switch (interaction.options.getSubcommand()) {
        case 'give': {
          if (guildUser == null) {
            await reply(
              interaction,
              translationManager.format(
                translations.commands.levels.user_doesnt_exist,
                [['user', user]],
              ),
              true,
            );
            return;
          }

          if (amount <= 0) {
            await reply(interaction, translations.commands.levels.level_to_give_must_be_positive, true);
            return;
          }

          guildUser.level += amount;
          guildUser.xp = getXpNeeded(guildUser.level);

          await guildUser.save();
          await reply(
            interaction,
            translationManager.format(
              translations.commands.levels.levels_added,
              [['amount', amount], ['plural', amount > 1 ? 's' : ''], ['user', `${user.username}#${user.discriminator}`]],
            ),
            false,
          );
          break;
        }
        case 'take': {
          if (guildUser == null) {
            await reply(
              interaction,
              translationManager.format(
                translations.commands.levels.user_doesnt_exist,
                [['user', user]],
              ),
              true,
            );
            return;
          }

          if (amount <= 0) {
            await reply(interaction, translations.commands.levels.level_to_take_must_be_positive, true);
            return;
          }

          guildUser.level -= amount;
          guildUser.xp = getXpNeeded(guildUser.level);

          await guildUser.save();
          await reply(
            interaction,
            translationManager.format(
              translations.commands.levels.levels_taken,
              [['amount', amount], ['plural', amount > 1 ? 's' : ''], ['user', `${user.username}#${user.discriminator}`]],
            ),
            false,
          );
          break;
        }
        default:
          await reply(interaction, 'Unknown Command', true);
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
