import { SelectMenuInteraction } from 'discord.js';
import { User } from '@prosperitybot/database';
import { LogInteractionError } from '../managers/ErrorManager';
import { SelectMenu } from '../typings/SelectMenu';
import {
  Format, GetTranslations, LanguageList, SetUserLocale,
} from '../managers/TranslationManager';
import { ReplyToInteraction } from '../managers/MessageManager';
import { IsWhitelabel } from '../managers/ClientManager';

const UserLanguageSelectMenu: SelectMenu = {
  name: 'language_user_menu',
  needsAccessLevel: [],
  needsPermissions: [],
  execute: async (interaction: SelectMenuInteraction) => {
    try {
      const translations = await GetTranslations(interaction.user.id, interaction.guildId!);
      const user: User = await User.findByPk(interaction.user.id);
      const locale = interaction.values[0];
      const language = LanguageList().find((l) => l.locale === locale)!;

      SetUserLocale(interaction.user.id, locale);
      user.locale = locale;
      await user.save();

      await ReplyToInteraction(
        interaction,
        Format(translations.menus.language_user_menu.language_updated, [['language_flag', language.flag], ['language_name', language.name]]),
        true,
        IsWhitelabel(interaction.client),
      );
    } catch (e) {
      await LogInteractionError(e, interaction);
    }
  },
};

export default UserLanguageSelectMenu;
