import * as Sentry from '@sentry/node';
import {
  BaseCommandInteraction, ButtonInteraction, Client, CommandInteraction, Guild, GuildMember, Message, SelectMenuInteraction,
} from 'discord.js';
import { IsWhitelabel } from './ClientManager';
import { ReplyToInteraction } from './MessageManager';

const IsIgnored = (error: Error): boolean => {
  const ignoreErrors = [
    'DiscordAPIError: Unknown Message',
    'DiscordAPIError: Missing Permissions',
    'DiscordAPIError: Missing Access',
    'DiscordAPIError: Unknown Channel',
    'DiscordAPIError: Cannot send messages to this user',
    'DiscordAPIError: Cannot execute action on a DM channel',
  ];

  let ignored = false;

  ignoreErrors.forEach((ie) => {
    if (error.stack?.includes(ie)) {
      ignored = true;
    }
  });

  return ignored;
};

export const LogInteractionError = async (error: Error, interaction: CommandInteraction | BaseCommandInteraction | SelectMenuInteraction | ButtonInteraction): Promise<void> => {
  if (!IsIgnored(error)) {
    Sentry.setTag('guild_id', interaction.guild?.id);
    Sentry.setTag('bot_id', interaction.applicationId);
    Sentry.setTag('user_id', interaction.user.id);
    if (interaction.isCommand()) {
      Sentry.setTag('command', interaction.commandName);
    }
    const errorCode = Sentry.captureException(error);
    await ReplyToInteraction(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true, IsWhitelabel(interaction.client));
  } else {
    await ReplyToInteraction(interaction, `There was an error while executing this interaction!\nError: ${error.message}`, true, IsWhitelabel(interaction.client));
  }
};

export const LogClientError = async (error: Error, client: Client): Promise<void> => {
  if (!IsIgnored(error)) {
    Sentry.setTag('bot_id', client.application?.id);
    Sentry.captureException(error);
  }
};

export const LogMessageError = (error: Error, message: Message): void => {
  if (!IsIgnored(error)) {
    Sentry.setTag('guild_id', message.guild?.id);
    Sentry.setTag('bot_id', message.applicationId);
    Sentry.setTag('user_id', message.author.id);
    Sentry.captureException(error);
  }
};

export const LogGuildError = (error: Error, guild: Guild): void => {
  if (!IsIgnored(error)) {
    Sentry.setTag('guild_id', guild.id);
    Sentry.setTag('bot_id', guild.applicationId);
    Sentry.captureException(error);
  }
};

export const LogMemberError = (error: Error, guildMember: GuildMember): void => {
  if (!IsIgnored(error)) {
    Sentry.setTag('user_id', guildMember.id);
    Sentry.setTag('guild_id', guildMember.guild.id);
    Sentry.setTag('bot_id', guildMember.client.application?.id);
    Sentry.captureException(error);
  }
};
