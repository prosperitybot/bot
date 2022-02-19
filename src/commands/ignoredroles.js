const { SlashCommandBuilder } = require('@discordjs/builders');
const { IgnoredRole } = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { reply } = require('../utils/messages');
const permissions = require('../utils/permissionUtils');
const translationManager = require('../translations/translationsManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ignoredroles')
    .setDescription('Adds a role that is ignored from gaining levels')
    .addSubcommand((subCommand) => subCommand
      .setName('add')
      .setDescription('Adds an ignored role')
      .addRoleOption((role) => role
        .setName('role')
        .setDescription('The role to ignore')))
    .addSubcommand((subCommand) => subCommand
      .setName('remove')
      .setDescription('Removes an ignored role')
      .addRoleOption((role) => role
        .setName('role')
        .setDescription('The role to remove from the ignored list')))
    .addSubcommand((subCommand) => subCommand
      .setName('list')
      .setDescription('Lists all of the ignored roles in the server')),
  async execute(interaction) {
    const translations = await translationManager.getTranslations(interaction.user.id, interaction.guild.id, interaction.client);
    if (!permissions.has(interaction.member, 'ADMINISTRATOR')) {
      await reply(interaction, translations.generic.access_denied, true);
      return;
    }
    try {
      switch (interaction.options.getSubcommand()) {
        case 'add': {
          const role = interaction.options.getRole('role');
          const ignoredRole = await IgnoredRole.findOne({ where: { id: role.id } });
          if (ignoredRole != null) {
            await reply(
              interaction,
              translationManager.format(
                translations.commands.ignoredroles.role_already_ignored,
                [['role', role]],
              ),
              true,
            );
            break;
          }

          await IgnoredRole.create({
            id: role.id,
            guildId: interaction.guild.id,
          });

          await reply(
            interaction,
            translationManager.format(
              translations.commands.ignoredroles.role_now_ignored,
              [['role', role]],
            ),
            false,
          );
          break;
        }
        case 'remove': {
          const role = interaction.options.getRole('role');
          const ignoredRole = await IgnoredRole.findOne({ where: { id: role.id } });
          if (ignoredRole == null) {
            await reply(
              interaction,
              translationManager.format(
                translations.commands.ignoredroles.role_not_ignored,
                [['role', role]],
              ),
              true,
            );
            break;
          }

          await ignoredRole.destroy();

          await reply(
            interaction,
            translationManager.format(
              translations.commands.ignoredroles.role_now_not_ignored,
              [['role', role]],
            ),
            false,
          );
          break;
        }
        case 'list': {
          const ignoredRoles = await IgnoredRole.findAll({
            where: { guildId: interaction.guild.id },
          });
          let listMsg = `${translations.commands.ignoredroles.role_list_title}: \n`;
          ignoredRoles.forEach((c) => {
            listMsg += `\n- <#${c.id}>`;
          });

          await reply(interaction, listMsg, false);
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
