import {
  Client, CommandInteraction, Constants, MessageActionRow, MessageButton,
} from 'discord.js';
import { WhitelabelBot } from '@prosperitybot/database';
import { Command } from '../typings/Command';
import { LogInteractionError } from '../managers/ErrorManager';
import { GetTranslations } from '../managers/TranslationManager';
import { ReplyToInteraction } from '../managers/MessageManager';
import { GetClient, IsWhitelabel } from '../managers/ClientManager';

const Whitelabel: Command = {
  data: {
    name: 'whitelabel',
    description: 'Manages a whitelabel bot',
    options: [
      {
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'setup',
        description: 'Runs the initial setup for whitelabel',
        options: [
          {
            type: Constants.ApplicationCommandOptionTypes.STRING,
            name: 'token',
            description: 'Bot Token',
            required: true,
          },
          {
            type: Constants.ApplicationCommandOptionTypes.STRING,
            name: 'bot_id',
            description: 'Bot Id',
            required: true,
          },
        ],
      },
      {
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'actions',
        description: 'Controls a whitelabel bot',
      },
      {
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'status',
        description: 'Sets the status of a whitelabel bot',
        options: [
          {
            type: Constants.ApplicationCommandOptionTypes.STRING,
            name: 'status_type',
            description: 'The type of status to display (e.g. Playing ...)',
            required: true,
            choices: [
              {
                name: 'Playing',
                value: 'PLAYING',
              },
              {
                name: 'Streaming',
                value: 'STREAMING',
              },
              {
                name: 'Listening',
                value: 'LISTENING',
              },
              {
                name: 'Watching',
                value: 'WATCHING',
              },
            ],
          },
          {
            type: Constants.ApplicationCommandOptionTypes.STRING,
            name: 'status_content',
            description: 'The content to display (e.g. Minecraft0',
            required: true,
          },
        ],
      },
    ],
    type: 'CHAT_INPUT',
  },
  needsAccessLevel: ['WHITELABEL'],
  needsPermissions: [],
  ownerOnly: false,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      const translations = await GetTranslations(interaction.user.id, interaction.guildId!);
      const command: string = interaction.options.getSubcommand();
      const currentBot: WhitelabelBot = WhitelabelBot.findOne({ where: { userId: interaction.user.id } });
      switch (command) {
        case 'setup': {
          const botToken = interaction.options.getString('token', true);
          const botId = interaction.options.getString('bot_id', true);

          if (currentBot !== null) {
            currentBot.oldBotId = currentBot.botId;
            currentBot.botId = botId;
            currentBot.token = botToken;
            currentBot.action = 'start';
            await currentBot.save();
          } else {
            await WhitelabelBot.create({
              botId,
              token: botToken,
              userId: interaction.user.id,
              action: 'start',
            });
          }
          const whitelabelInviteRow = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setLabel('Invite me!')
                .setStyle(Constants.MessageButtonStyles.LINK)
                .setURL(`https://discord.com/oauth2/authorize?client_id=${botId}&permissions=277294156864&scope=applications.commands%20bot`),
            );
          await ReplyToInteraction(interaction, translations.commands.whitelabel.whitelabel_bot_created_started, true, IsWhitelabel(client), [whitelabelInviteRow]);

          break;
        }
        case 'actions': {
          if (currentBot === null) {
            await ReplyToInteraction(interaction, translations.commands.whitelabel.whitelabel_bot_not_active, true, IsWhitelabel(client));
            break;
          }

          const whitelabelActionRow = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setLabel('Start')
                .setStyle(Constants.MessageButtonStyles.SUCCESS)
                .setCustomId('whitelabel-bot_start')
                .setDisabled(currentBot.last_action !== 'stop'),
              new MessageButton()
                .setLabel('Restart')
                .setStyle(Constants.MessageButtonStyles.PRIMARY)
                .setCustomId('whitelabel-bot_restart'),
              new MessageButton()
                .setLabel('Stop')
                .setStyle(Constants.MessageButtonStyles.DANGER)
                .setCustomId('whitelabel-bot_stop')
                .setDisabled(currentBot.last_action === 'stop'),
            );

          await ReplyToInteraction(interaction, translations.commands.whitelabel.whitelabel_bot_actions, true, IsWhitelabel(client), [whitelabelActionRow]);
          break;
        }
        case 'status': {
          if (currentBot === null) {
            await ReplyToInteraction(interaction, translations.commands.whitelabel.whitelabel_bot_not_active, true, IsWhitelabel(client));
            break;
          }

          currentBot.statusType = interaction.options.getString('status_type', true);
          currentBot.statusContent = interaction.options.getString('status_content', true);
          await currentBot.save();

          GetClient(currentBot.botId).user?.setActivity({ type: currentBot.statusType, name: currentBot.statusContent });
          await ReplyToInteraction(interaction, 'Updated activity', true, IsWhitelabel(client));
          break;
        }
        default:
          break;
      }
    } catch (e) {
      await LogInteractionError(e, interaction);
    }
  },
};

export default Whitelabel;
