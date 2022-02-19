/* eslint-disable max-len */
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { User, GuildUser, LevelRole } = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { Op } = require('sequelize');
const { editReply, reply } = require('../utils/messages');
const { http } = require('../utils/httpUtils');
const { getXpNeeded } = require('../utils/levelUtils');

module.exports = {
  name: 'import_from',
  async execute(interaction) {
    try {
      switch (interaction.values[0]) {
        case 'import_from-mee6': {
          const confirmMee6Row = new MessageActionRow()
            .addComponents(
              new MessageSelectMenu()
                .setCustomId('import_from')
                .setPlaceholder('Please confirm...')
                .addOptions([
                  {
                    label: 'Yes',
                    description: 'This will import all existing members levels from Mee6 into Prosperity',
                    value: 'import_from-mee6-confirm',
                    emoji: '✅',
                  },
                  {
                    label: 'No',
                    description: 'This will cancel the pending transfer',
                    value: 'import_from-mee6-cancel',
                    emoji: '❎',
                  },
                ]),
            );
          await reply(interaction, 'Please confirm that you want the transfer to go ahead. \n**NOTE**: This will only move the data of the users that are currently in the server.', true, [confirmMee6Row]);
          break;
        }
        case 'import_from-piggy': {
          const confirmMee6Row = new MessageActionRow()
            .addComponents(
              new MessageSelectMenu()
                .setCustomId('import_from')
                .setPlaceholder('Please confirm...')
                .addOptions([
                  {
                    label: 'Yes',
                    description: 'This will import all existing members levels from Piggy into Prosperity',
                    value: 'import_from-piggy-confirm',
                    emoji: '✅',
                  },
                  {
                    label: 'No',
                    description: 'This will cancel the pending transfer',
                    value: 'import_from-mee6-cancel',
                    emoji: '❎',
                  },
                ]),
            );
          await reply(interaction, 'Please confirm that you want the transfer to go ahead. \n**NOTE**: This will only move the data of the users that are currently in the server.', true, [confirmMee6Row]);
          break;
        }
        case 'import_from-mee6-confirm': {
          await reply(interaction, 'Currently migrating users from Mee6 to prosperity', true);
          // Run MEE6 Logic
          let stillSearching = true;
          let currentPage = 0;
          let userCount = 0;
          while (stillSearching) {
            // eslint-disable-next-line no-await-in-loop
            const { data } = await http.get(`https://mee6.xyz/api/plugins/levels/leaderboard/${interaction.guild.id}?limit=1000&page=${currentPage}`);
            if (currentPage === 0) {
              const roleRewards = data.role_rewards;
              roleRewards.forEach(async (role) => {
                await LevelRole.create({
                  id: role.role.id,
                  level: role.rank,
                  guildId: interaction.guild.id,
                });
              });
            }
            if (data.players.length === 0 || currentPage === 50) {
              stillSearching = false;
            } else {
              currentPage += 1;
              userCount += data.players.length;
              data.players.forEach(async (user) => {
                interaction.guild.members.fetch(user.id.toString()).then(async (dUser) => {
                  await User.upsert({
                    id: user.id,
                    username: user.username,
                    discriminator: user.discriminator,
                  });
                  let gu = await GuildUser.findOne({
                    where: {
                      userId: user.id,
                      guildId: interaction.guild.id,
                    },
                  });
                  if (gu == null) {
                    gu = await GuildUser.create({
                      userId: user.id,
                      guildId: interaction.guild.id,
                      level: user.level,
                      xp: user.xp,
                      messageCount: user.message_count,
                    });
                  } else {
                    gu.level = user.level;
                    gu.xp = user.xp;
                    gu.xp = getXpNeeded(user.level);
                    gu.messageCount = user.message_count;
                    await gu.save();
                  }
                  const roleToAssign = await LevelRole.findOne({
                    where: {
                      level: { [Op.lte]: user.level },
                      guildId: interaction.guild.id,
                    },
                  });
                  dUser.roles.add(roleToAssign.id.toString());
                }).catch((e) => Sentry.captureException(e));
              });
            }
          }
          await editReply(interaction, `You have successfully migrated **${userCount}** users.`, true);
          break;
        }
        case 'import_from-piggy-confirm': {
          await reply(interaction, 'Currently migrating users from Piggy to prosperity', true);
          // Run Piggy Logic
          let stillSearching = true;
          let currentPage = 1;
          let userCount = 0;
          while (stillSearching) {
            // eslint-disable-next-line no-await-in-loop
            const { data } = await http.get(`https://api.piggy.gg/api/v1/public/guilds/${interaction.guild.id}/leaderboard/player?limit=50&page=${currentPage}`);
            if (data.data.leaderboard.length === 0 || currentPage === 50) {
              stillSearching = false;
            } else {
              currentPage += 1;
              userCount += data.data.leaderboard.length;
              data.data.leaderboard.forEach(async (user) => {
                await User.upsert({
                  id: user.id,
                  username: user.name,
                  discriminator: '0000',
                });
                let gu = await GuildUser.findOne({
                  where: {
                    userId: user.id,
                    guildId: interaction.guild.id,
                  },
                });
                if (gu == null) {
                  gu = await GuildUser.create({
                    userId: user.id,
                    guildId: interaction.guild.id,
                    level: user.level,
                    xp: user.total_xp,
                  });
                } else {
                  gu.level = user.level;
                  gu.xp = user.total_xp;
                  await gu.save();
                }
              });
            }
          }
          await editReply(interaction, `You have successfully migrated **${userCount}** users.`, true);
          break;
        }
        case 'import_from-mee6-cancel':
          await reply(interaction, 'Transfer Cancelled', true);
          break;
        default:
          break;
      }
    } catch (e) {
      const errorCode = Sentry.captureException(e);
      await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
    }
  },
};
