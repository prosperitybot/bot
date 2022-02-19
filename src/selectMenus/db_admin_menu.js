const {
  Guild, User, GuildUser, migrate,
} = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { editReply, reply } = require('../utils/messages');

module.exports = {
  name: 'db_admin_menu',
  async execute(interaction) {
    try {
      switch (interaction.values[0]) {
        case 'db_run_migrations': {
          migrate();
          await reply(interaction, 'Migrations Ran Successfully', true);
          break;
        }
        case 'db_run_migrations_force':
          migrate(true);
          await reply(interaction, 'Database cleared & Migrations Ran', true);
          break;
        case 'db_seed':
          await reply(interaction, 'Seeding database, this may take a while', true);
          try {
            interaction.client.guilds.cache.forEach(async (guild) => {
              const g = await Guild.findByPk(guild.id);
              if (g == null) {
                await Guild.create({
                  id: guild.id,
                  name: guild.name,
                  premium: false,
                });
                console.log(`Added guild #${guild.id} (${guild.name})`);
                guild.members.cache.forEach(async (member) => {
                  if (!member.user.bot) {
                    const u = await User.findByPk(member.id);
                    if (u == null) {
                      await User.upsert({
                        id: member.id,
                        username: member.user.username,
                        discriminator: member.user.discriminator,
                      });
                      await GuildUser.create({
                        userId: member.id,
                        guildId: guild.id,
                        level: 0,
                        xp: 0,
                      });
                      console.log(`Added user #${member.id} (${member.displayName})`);
                    }
                  }
                });
              }
            });
            await editReply(interaction, 'Database Seeded', true);
          } catch (e) {
            const errorCode = Sentry.captureException(e);
            // eslint-disable-next-line max-len
            await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
          }
          break;
        default:
          break;
      }
    } catch (e) {
      Sentry.captureException(e);
    }
  },
};
