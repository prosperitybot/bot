import { SelectMenuInteraction } from 'discord.js';
import { Guild } from '@prosperitybot/database';
import { LogInteractionError } from '../managers/ErrorManager';
import { SelectMenu } from '../typings/SelectMenu';
import {
  Format, GetTranslations, LanguageList, SetGuildLocale,
} from '../managers/TranslationManager';
import { ReplyToInteraction } from '../managers/MessageManager';
import { IsWhitelabel } from '../managers/ClientManager';

const ServerLanguageSelectMenu: SelectMenu = {
  name: 'language_server_menu',
  execute: async (interaction: SelectMenuInteraction) => {
    try {
      const translations = await GetTranslations(interaction.user.id, interaction.guildId!);
      const guild: Guild = await Guild.findByPk(interaction.guildId);
      const locale = interaction.values[0];
      const language = LanguageList().find((l) => l.locale === locale)!;

      SetGuildLocale(interaction.guildId!, locale);
      guild.locale = locale;
      await guild.save();

      await ReplyToInteraction(
        interaction,
        Format(translations.menus.language_server_menu.language_updated, [['language_flag', language.flag], ['language_name', language.name]]),
        true,
        IsWhitelabel(interaction.client),
      );
    } catch (e) {
      await LogInteractionError(e, interaction);
    }
  },
};

export default ServerLanguageSelectMenu;
