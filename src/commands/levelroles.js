const { SlashCommandBuilder } = require('@discordjs/builders');
const { GuildUser, LevelRole } = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { Op } = require('sequelize');
const { reply, editReply } = require('../utils/messages');
const permissions = require('../utils/permissionUtils');
const translationManager = require('../translations/translationsManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('levelroles')
    .setDescription('Manages level roles')
    .addSubcommand((subCommand) => subCommand
      .setName('add')
      .setDescription('Adds a role that is granted when a user reaches a certain level')
      .addRoleOption((options) => options.setName('role')
        .setDescription('The role you want to give')
        .setRequired(true)).addIntegerOption((options) => options.setName('level')
        .setDescription('The levels to give the role at')
        .setRequired(true)))
    .addSubcommand((subCommand) => subCommand
      .setName('remove')
      .setDescription('Removes a role that is granted when a user reaches a certain level')
      .addRoleOption((options) => options.setName('role')
        .setDescription('The role you want to remove')
        .setRequired(true)))
    .addSubcommand((subCommand) => subCommand
      .setName('list')
      .setDescription('Lists all of the level roles in the server')),
  async execute(interaction) {
    const translations = await translationManager.get(interaction.guild.id, interaction.client);
    if (!permissions.has(interaction.member, 'ADMINISTRATOR')) {
      await reply(interaction, translations.generic.access_denied, true);
      return;
    }
    try {
      switch (interaction.options.getSubcommand()) {
        case 'add': {
          const role = interaction.options.getRole('role');
          const levelRole = await LevelRole.findOne({ where: { id: role.id } });
          const level = interaction.options.getInteger('level');
          if (levelRole != null) {
            await reply(
              interaction,
              translationManager.format(
                translations.commands.levelroles.role_already_used,
                [['role', role]],
              ),
              true,
            );
            return;
          }

          if (level <= 0) {
            await reply(interaction, translations.commands.levelroles.level_must_be_positive, true);
            return;
          }

          await LevelRole.create({
            id: role.id,
            guildId: interaction.guild.id,
            level,
          });

          const nextHighestRole = await LevelRole.findOne({
            where: {
              level: { [Op.gt]: level },
              guildId: interaction.guild.id,
            },
          });
          let newHighestLevel = 1000;
          if (nextHighestRole != null) {
            newHighestLevel = nextHighestRole.level;
          }

          await reply(
            interaction,
            translationManager.format(
              translations.commands.levelroles.role_granted,
              [['role', role], ['level', level]],
            ),
            false,
          );

          const { count: dbMemberCount, rows: dbMembers } = await GuildUser.findAndCountAll({
            where: {
              level: { [Op.gte]: level, [Op.lt]: newHighestLevel },
              guildId: interaction.guild.id,
            },
          });
          await editReply(
            interaction,
            translationManager.format(
              translations.commands.levelroles.role_granted_status,
              [['role', role], ['level', level], ['amount', dbMemberCount]],
            ),
            false,
          );
          dbMembers.forEach(async (dbMember) => {
            interaction.guild.members.fetch(dbMember.userId.toString()).then((member) => {
              member.roles.add(role.id.toString(), 'Level role was added');
            }).catch((e) => console.log(`Could not add role - ${e}`));
          });

          await editReply(
            interaction,
            translationManager.format(
              translations.commands.levelroles.role_granted_status_complete,
              [['role', role], ['level', level], ['amount', dbMemberCount]],
            ),
            false,
          );
          break;
        }
        case 'remove': {
          const role = interaction.options.getRole('role');
          const levelRole = await LevelRole.findOne({ where: { id: role.id } });
          if (levelRole == null) {
            await reply(interaction, translations.commands.levelroles.role_not_used, true);
          }
          await reply(
            interaction,
            translationManager.format(
              translations.commands.levelroles.role_removed,
              [['role', role], ['level', levelRole.level]],
            ),
            false,
          );
          await levelRole.destroy();

          interaction.guild.roles.cache.get(role.id).members.forEach((m) => {
            m.roles.remove(role);
          });
          break;
        }
        case 'list': {
          const levelRoles = await LevelRole.findAll({ where: { guildId: interaction.guild.id } });
          let listMsg = 'Level Roles: \n';
          levelRoles.forEach((c) => {
            listMsg += `\n- <@&${c.id}> *(Level ${c.level})*`;
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
