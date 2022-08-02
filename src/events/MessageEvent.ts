import {
  Client,
  Constants,
  Message,
  MessageActionRow,
  MessageButton,
} from 'discord.js';
import {
  Guild,
  GuildUser,
  IgnoredChannel,
  IgnoredRole,
  LevelRole,
  MessageLog,
  User,
} from '@prosperitybot/database';
import { Op, fn } from 'sequelize';
import { LogMessageError } from '../managers/ErrorManager';
import { Format, GetTranslations } from '../managers/TranslationManager';

import { Event } from '../typings/Event';
import { GetXpForNextLevel } from '../managers/GuildUserManager';
import { ReplyToMessage, SendMessage } from '../managers/MessageManager';
import { EventLogger } from '../utils/Logging';
import { IsWhitelabel, UpdateClient } from '../managers/ClientManager';

const MessageEvent: Event = {
  name: 'messageCreate',
  type: 'on',
  on: async (client: Client, args: any[]) => {
    UpdateClient(client);
    const message: Message = args[0];
    if (message.author.bot) return;

    try {
      const guild: Guild = await Guild.findByPk(message.guildId);

      await User.upsert({
        id: message.author.id,
        username: message.author.username,
        discriminator: message.author.discriminator,
      });

      const translations = await GetTranslations(
        message.author.id,
        message.guildId!,
      );

      let guildUser: GuildUser | null = await GuildUser.findOne({
        where: { guildId: message.guildId, userId: message.author.id },
      });

      if (guildUser === null) {
        guildUser = await GuildUser.create({
          userId: message.author.id,
          guildId: message.guildId,
          level: 0,
          xp: 0,
          lastXpMessageSent: fn('SYSDATE'),
        });
      }

      if (message.author.id === '126429064218017802') {
        console.log((Date.now() - guildUser.lastXpMessageSent) / 1000);
      }
      if ((Date.now() - guildUser.lastXpMessageSent) / 1000 >= guild.xpDelay) {
        if (message.author.id === '126429064218017802') {
          console.log("Message is old enough to be xp'd");
        }
        await MessageLog.create({
          userId: message.author.id,
          guildId: message.guildId,
        });

        const ignoredChannel: IgnoredChannel | null = await IgnoredChannel.findByPk(message.channelId);
        const ignoredRole: IgnoredRole[] = await IgnoredRole.findAll({
          where: { id: message.member?.roles.cache.map((mr) => mr.id) },
        });

        if (message.author.id === '126429064218017802') {
          console.log(ignoredChannel);
          console.log(ignoredRole);
        }

        if (ignoredChannel === null && ignoredRole.length === 0) {
          if (message.author.id === '126429064218017802') {
            console.log('Message is not ignored');
          }
          guildUser.messageCount += 1;
          const xpToGain = Math.floor(Math.random() * (15 - 7 + 1) + 7) * guild.xpRate;

          guildUser.xp += xpToGain;
          guildUser.lastXpMessageSent = fn('SYSDATE');

          if (guildUser.xp > GetXpForNextLevel(guildUser)) {
            guildUser.level += 1;
            const newLevelRole: LevelRole | null = await LevelRole.findOne({
              where: { level: guildUser.level, guildId: message.guildId },
            });
            if (newLevelRole !== null) {
              message.member?.roles.add(newLevelRole.id, 'User Levelled up');
              if (guild.roleAssignType === 'single') {
                const oldLevelRole: LevelRole | null = await LevelRole.findOne({
                  where: {
                    level: { [Op.lt]: guildUser.level },
                    guildId: message.guildId,
                  },
                });
                if (oldLevelRole !== null) {
                  message.member?.roles.remove(
                    oldLevelRole.id,
                    'User Levelled up',
                  );
                }
              }
            }

            // Send level up message.
            switch (guild.notificationType) {
              case 'reply':
                await ReplyToMessage(
                  message,
                  Format(
                    translations.events.message_create.message_level_up_reply,
                    [
                      ['user', message.author.tag],
                      ['level', guildUser.level],
                    ],
                  ),
                  IsWhitelabel(client),
                );
                break;
              case 'channel':
                // eslint-disable-next-line no-case-declarations
                const textChannel = await message.guild?.channels.fetch(
                  guild.notificationChannel,
                );
                if (
                  textChannel !== undefined
                  && textChannel !== null
                  && textChannel.isText()
                ) {
                  await SendMessage(
                    textChannel,
                    Format(
                      translations.events.message_create
                        .message_level_up_channel,
                      [
                        ['user', message.author.tag],
                        ['level', guildUser.level],
                      ],
                    ),
                    IsWhitelabel(client),
                  );
                }
                break;
              case 'dm':
                message.author
                  .createDM()
                  .then(async (dmChannel) => {
                    const serverButton = new MessageActionRow().addComponents(
                      new MessageButton()
                        .setLabel(`Sent from ${guild.name}`)
                        .setStyle(Constants.MessageButtonStyles.LINK)
                        .setURL(message.url),
                    );
                    await SendMessage(
                      dmChannel,
                      Format(
                        translations.events.message_create.message_level_up_dm,
                        [
                          ['user', message.author.tag],
                          ['level', guildUser.level],
                        ],
                      ),
                      IsWhitelabel(client),
                      [serverButton],
                    );
                  })
                  .catch((e: Error) => EventLogger.error(`Could not open a dm - ${e.message}`));
                break;
              default:
                break;
            }
          }

          await guildUser.save();
        }
      }
    } catch (e) {
      await LogMessageError(e, message);
      if (message.author.id === '126429064218017802') {
        console.log(e);
      }
    }
  },
};

export default MessageEvent;
