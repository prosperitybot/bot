import { Collection } from 'discord.js';
import { Guild, User } from '@prosperitybot/database';
import { TranslationFile } from '../typings/Translation';
import { Language } from '../typings/Language';

const TranslationFiles: Collection<string, TranslationFile> = new Collection();
const GuildLocale: Collection<string, string> = new Collection();
const UserLocale: Collection<string, string> = new Collection();
const GuildLocalePreference: Collection<string, boolean> = new Collection();

const GetUserLocale = async (userId): Promise<string | undefined> => {
  if (UserLocale.get(userId) !== undefined) {
    return UserLocale.get(userId);
  }

  const user = await User.findByPk(userId);
  if (user === null) {
    return undefined;
  }
  if (user?.locale !== null) {
    UserLocale.set(userId, user.locale);
  }

  return UserLocale.get(userId);
};

export const SetUserLocale = (userId: string, locale: string): void => {
  UserLocale.set(userId, locale);
};
export const SetGuildLocale = (guildId: string, locale: string): void => {
  GuildLocale.set(guildId, locale);
};

export const GetTranslations = async (userId: string, guildId: string): Promise<TranslationFile> => {
  if (GuildLocalePreference.get(guildId) === undefined) {
    const guild = await Guild.findByPk(guildId);
    GuildLocalePreference.set(guildId, guild.serverLocaleOnly);
    GuildLocale.set(guildId, guild.locale);
  }

  const guildLocale = TranslationFiles.get(GuildLocale.get(guildId)!);
  const userLocale = await GetUserLocale(userId);
  if (GuildLocalePreference.get(guildId) === true || userLocale === undefined) {
    return guildLocale!;
  }

  return TranslationFiles.get(userLocale)!;
};

export const SetupTranslation = (locale: string): void => {
  // eslint-disable-next-line
  const translation: TranslationFile = require(`../../translations/${locale}`);
  TranslationFiles.set(locale, translation);
};

export const Format = (stringToFormat: string, formatter: Array<Array<string | number>>): string => {
  let formatted = stringToFormat;
  formatter.forEach((f) => {
    formatted = formatted.replaceAll(`%${f[0]}%`, f[1].toString());
  });
  return formatted;
};

export const LanguageList = (): Language[] => [
  { flag: '🌐', locale: 'ar-SA', name: 'Arabic' },
  { flag: '🌐', locale: 'ca-ES', name: 'Catalan' },
  { flag: '🇨🇳', locale: 'zh-CN', name: 'Chinese (Simplified)' },
  { flag: '🇨🇳', locale: 'zh-TW', name: 'Chinese (Traditional)' },
  { flag: '🐈', locale: 'lol-US', name: 'English (LOLCAT)' },
  { flag: '🏴‍☠️', locale: 'en-PT', name: 'English (Pirate)' },
  { flag: '🇺🇸', locale: 'en-US', name: 'English (United States)' },
  { flag: '🇪🇪', locale: 'et-EE', name: 'Estonian' },
  { flag: '🇫🇷', locale: 'fr-FR', name: 'French' },
  { flag: '🇩🇪', locale: 'de-DE', name: 'German' },
  { flag: '🇬🇷', locale: 'el-GR', name: 'Greek' },
  { flag: '🇮🇩', locale: 'id-ID', name: 'Indonesian' },
  { flag: '🇯🇵', locale: 'ja-JP', name: 'Japanese' },
  { flag: '🇵🇹', locale: 'pt-PT', name: 'Portuguese' },
  { flag: '🇵🇹', locale: 'pt-BR', name: 'Portuguese (Brazilian)' },
  { flag: '🇷🇺', locale: 'ru-RU', name: 'Russian' },
  { flag: '🇷🇸', locale: 'sr-SP', name: 'Serbian' },
  { flag: '🇪🇸', locale: 'es-ES', name: 'Spanish' },
];
