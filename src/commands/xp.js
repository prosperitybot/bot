const { SlashCommandBuilder } = require('@discordjs/builders');
const { GuildUser, LevelRole } = require('@prosperitybot/database');
const { Op } = require('sequelize');
const Sentry = require('@sentry/node');
const { getXpNeeded } = require('../utils/levelUtils');
const { reply } = require('../utils/messages');
const permissions = require('../utils/permissionUtils');
const translationManager = require('../translations/translationsManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('xp')
    .setDescription('Provides commands to give/remove xp from a user')
    .addSubcommand((subCommand) => subCommand
      .setName('give')
      .setDescription('Gives xp to a user')
      .addUserOption((options) => options.setName('user')
        .setDescription('The user you want to give xp to')
        .setRequired(true))
      .addIntegerOption((options) => options.setName('amount')
        .setDescription('The amount of xp to give')
        .setRequired(true)))
    .addSubcommand((subCommand) => subCommand
      .setName('take')
      .setDescription('Takes xp from a user')
      .addUserOption((options) => options.setName('user')
        .setDescription('The user you want to take xp from')
        .setRequired(true))
      .addIntegerOption((options) => options.setName('amount')
        .setDescription('The amount of xp to take')
        .setRequired(true))),
  async execute(interaction) {
    const translations = await translationManager.get(interaction.guild.id, interaction.client);
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
                translations.commands.xp.user_doesnt_exist,
                [['user', user]],
              ),
              true,
            );
            return;
          }

          if (amount <= 0) {
            await reply(interaction, translations.commands.xp.xp_to_give_must_be_positive, true);
            return;
          }

          guildUser.xp += amount;
          if (guildUser.xp > getXpNeeded(guildUser.level + 1)) {
            guildUser.level += 1;
            const newLevelRole = await LevelRole.findOne({
              where: {
                level: guildUser.level,
                guildId: interaction.guild.id,
              },
            });
            if (newLevelRole != null) {
              user.member.roles.add(newLevelRole.id.toString(), 'Xp was added to the user');
              const oldLevelRole = await LevelRole.findOne({
                where: {
                  level: { [Op.lt]: guildUser.level },
                  guildId: interaction.guild.id,
                },
              });
              if (oldLevelRole != null) {
                user.member.roles.remove(oldLevelRole.id.toString());
              }
            }
          }

          await guildUser.save();
          await reply(
            interaction,
            translationManager.format(
              translations.commands.xp.xp_added,
              [['amount', amount], ['user', `${user.username}#${user.discriminator}`]],
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
                translations.commands.xp.user_doesnt_exist,
                [['user', user]],
              ),
              true,
            );
            return;
          }

          if (amount <= 0) {
            await reply(interaction, translations.commands.xp.xp_to_take_must_be_positive, true);
            return;
          }

          guildUser.xp -= amount;
          if (guildUser.xp < getXpNeeded(guildUser.level)) {
            guildUser.level -= 1;
            const oldLevelRole = await LevelRole.findOne({
              where: {
                level: guildUser.level,
                guildId: interaction.guild.id,
              },
            });
            if (oldLevelRole != null) {
              user.member.roles.remove(oldLevelRole.id.toString());
              const newLevelRole = await LevelRole.findOne({
                where: {
                  level: { [Op.lt]: guildUser.level },
                  guildId: interaction.guild.id,
                },
              });
              if (newLevelRole != null) {
                user.member.roles.add(newLevelRole.id.toString(), 'Xp was added to the user');
              }
            }
          }

          await guildUser.save();
          await reply(
            interaction,
            translationManager.format(
              translations.commands.xp.xp_taken,
              [['amount', amount], ['user', `${user.username}#${user.discriminator}`]],
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
