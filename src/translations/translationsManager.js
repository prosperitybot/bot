const { Guild } = require('@prosperitybot/database');

const completedLanguages = [
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

module.exports = {
  get: async (guildId, client) => {
    let locale;
    if (client.guildTranslations.get(guildId) === undefined) {
      const guild = await Guild.findByPk(guildId);
      client.guildTranslations.set(guildId, guild.locale);
      locale = guild.locale;
    } else {
      locale = client.guildTranslations.get(guildId);
    }
    return client.translations.get(locale);
  },
  format: (str, format) => {
    let formatted = str;
    format.forEach((f) => {
      formatted = formatted.replaceAll(`%${f[0]}%`, f[1]);
    });
    return formatted;
  },
  languageList: () => completedLanguages,
};
