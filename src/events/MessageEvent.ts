import {
  Client, Constants, Message, MessageActionRow, MessageButton,
} from 'discord.js';
import {
  Guild, GuildUser, IgnoredChannel, IgnoredRole, LevelRole, MessageLog, User,
} from '@prosperitybot/database';
import { Op, fn } from 'sequelize';
import { LogMessageError } from '../managers/ErrorManager';
import { Format, GetTranslations } from '../managers/TranslationManager';

import { Event } from '../typings/Event';
import { GetXpForNextLevel } from '../managers/GuildUserManager';
import { ReplyToMessage, SendMessage } from '../managers/MessageManager';

const MessageEvent: Event = {
  name: 'messageCreate',
  type: 'on',
  on: async (client: Client, args: any[]) => {
    const message: Message = args[0];
    if (message.author.bot) return;

    try {
      const translations = await GetTranslations(message.author.id, message.guildId!);
      const guild: Guild = await Guild.findByPk(message.guildId);

      await User.upsert({
        id: message.author.id,
        username: message.author.username,
        discriminator: message.author.discriminator,
      });

      let guildUser: GuildUser | null = await GuildUser.findOne({ where: { guildId: message.guildId, userId: message.author.id } });

      if (guildUser === null) {
        guildUser = await GuildUser.create({
          userId: message.author.id,
          guildId: message.guildId,
          level: 0,
          xp: 0,
          lastXpMessageSent: fn('NOW'),
        });
      }

      if ((Date.now() - guildUser.lastXpMessageSent) / 1000 >= 60) {
        await MessageLog.create({ userId: message.author.id, guildId: message.guildId });

        const ignoredChannel: IgnoredChannel | null = await IgnoredChannel.findByPk(message.channelId);
        const ignoredRole: IgnoredRole[] = await IgnoredRole.findAll({ where: { id: message.member?.roles.cache.map((mr) => mr.id) } });

        if (ignoredChannel === null && ignoredRole.length === 0) {
          guildUser.messageCount += 1;
          const xpToGain = Math.floor(Math.random() * (15 - 7 + 1) + 7) * guild.xpRate;

          guild.xp += xpToGain;
          guild.lastXpMessageSent = fn('NOW');

          if (guildUser.xp > GetXpForNextLevel(guildUser)) {
            const newLevelRole: LevelRole | null = await LevelRole.findOne({ where: { level: guildUser.level, guildId: message.guildId } });
            if (newLevelRole !== null) {
              message.member?.roles.add(newLevelRole.id, 'User Levelled up');
              if (guild.roleAssignType === 'single') {
                const oldLevelRole: LevelRole | null = await LevelRole.findOne({ where: { level: { [Op.lt]: guildUser.level }, guildId: message.guildId } });
                if (oldLevelRole !== null) {
                  message.member?.roles.remove(oldLevelRole.id, 'User Levelled up');
                }
              }
            }

            // Send level up message.
            switch (guild.notificationType) {
              case 'reply':
                await ReplyToMessage(message, Format(translations.events.message_create.message_level_up_reply, [['user', message.author.tag], ['level', guildUser.level]]));
                break;
              case 'channel':
                // eslint-disable-next-line no-case-declarations
                const textChannel = await message.guild?.channels.fetch(guild.notificationChannel);
                if (textChannel !== undefined && textChannel !== null && textChannel.isText()) {
                  await SendMessage(textChannel, Format(translations.events.message_create.message_level_up_channel, [['user', message.author.tag], ['level', guildUser.level]]));
                }
                break;
              case 'dm':
                message.author.createDM().then(async (dmChannel) => {
                  const serverButton = new MessageActionRow()
                    .addComponents(
                      new MessageButton()
                        .setLabel(`Sent from ${guild.name}`)
                        .setStyle(Constants.MessageButtonStyles.LINK)
                        .setDisabled(true),
                    );
                  await SendMessage(
                    dmChannel,
                    Format(translations.events.message_create.message_level_up_dm, [['user', message.author.tag], ['level', guildUser.level]]),
                    [serverButton],
                  );
                }).catch(() => {});
                break;
              default:
                break;
            }
          } else {
            await guildUser.save();
          }
        }
      }
    } catch (e) {
      await LogMessageError(e, message);
    }
  },
};

export default MessageEvent;
