import { BaseCommandInteraction, Client, MessageEmbed } from 'discord.js';
import {
  Guild, GuildUser, User, MessageLog,
} from '@prosperitybot/database';
import { Op } from 'sequelize';
import { Command } from '../typings/Command';
import { CreateEmbed } from '../managers/MessageManager';
import { LogInteractionError } from '../managers/ErrorManager';
import { GetTranslations } from '../managers/TranslationManager';
import { IsWhitelabel } from '../managers/ClientManager';

const About: Command = {
  data: {
    name: 'about',
    description: 'Information about the bot',
    type: 'CHAT_INPUT',
  },
  needsAccessLevel: [],
  needsPermissions: [],
  ownerOnly: false,
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    try {
      const translations = await GetTranslations(interaction.user.id, interaction.guildId!);

      const guildCount: number = await Guild.count();
      const userCount: number = await GuildUser.count({ distinct: false });

      const embed: MessageEmbed = CreateEmbed(IsWhitelabel(client));
      const totalMessageCount: Number = await MessageLog.count();
      const translators: User[] = await User.findAll({ where: { access_levels: { [Op.substring]: 'TRANSLATOR' } }, order: [['username', 'ASC']] });
      const administrators: User[] = await User.findAll({ where: { access_levels: { [Op.substring]: 'ADMINISTRATOR' } }, order: [['username', 'ASC']] });
      const developers: User[] = await User.findAll({ where: { access_levels: { [Op.substring]: 'DEVELOPER' } }, order: [['username', 'ASC']] });
      const owners: User[] = await User.findAll({ where: { access_levels: { [Op.substring]: 'OWNER' } }, order: [['username', 'ASC']] });

      let translatorMsg = `${translations.commands.about.translators_description}\n`;
      let administratorMsg = `${translations.commands.about.administrators_description}\n`;
      let developerMsg = `${translations.commands.about.developers_description}\n`;
      let ownerMsg = `${translations.commands.about.owners_description}\n`;

      translators.forEach((u) => { translatorMsg += `- ${u.username}#${u.discriminator}\n`; });
      administrators.forEach((u) => { administratorMsg += `- ${u.username}#${u.discriminator}\n`; });
      developers.forEach((u) => { developerMsg += `- ${u.username}#${u.discriminator}\n`; });
      owners.forEach((u) => { ownerMsg += `- ${u.username}#${u.discriminator}\n`; });

      embed.setDescription(translations.commands.about.bot_description);
      embed.addField('Bot Statistics', `Servers: ${guildCount}
      Total Members: ${userCount}
      Total Messages: ${totalMessageCount}`);

      embed.addField(`<:prosperity_owner:940692775454797825> Owners (${owners.length})`, ownerMsg);
      embed.addField(`<:prosperity_dev:940692660388261928> Developers (${developers.length})`, developerMsg);
      embed.addField(`<:prosperity_admin:940692667216564244> Administrators (${administrators.length})`, administratorMsg);
      embed.addField(`<:prosperity_language:940692871181381632> Translators (${translators.length})`, translatorMsg);

      interaction.reply({ embeds: [embed] });
      return;
    } catch (e) {
      await LogInteractionError(e, interaction);
    }
  },
};

export default About;
