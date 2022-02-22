import { BaseCommandInteraction, Client, MessageEmbed } from 'discord.js';
import * as Sentry from '@sentry/node';
import { User, MessageLog } from '@prosperitybot/database';
import { Op } from 'sequelize';
import { Command } from '../typings/Command';
import { CreateEmbed, ReplyToInteraction } from '../utils/messageUtils';

const About: Command = {
  name: 'about',
  needsAccessLevel: [],
  needsPermissions: [],
  ownerOnly: false,
  description: 'Information about the bot',
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    try {
      const embed: MessageEmbed = CreateEmbed();
      const totalMessageCount: Number = await MessageLog.count();
      const translators: User[] = await User.findAll({ where: { access_levels: { [Op.substring]: 'TRANSLATOR' } }, order: [['username', 'ASC']] });
      const administrators: User[] = await User.findAll({ where: { access_levels: { [Op.substring]: 'ADMINISTRATOR' } }, order: [['username', 'ASC']] });
      const developers: User[] = await User.findAll({ where: { access_levels: { [Op.substring]: 'DEVELOPER' } }, order: [['username', 'ASC']] });
      const owners: User[] = await User.findAll({ where: { access_levels: { [Op.substring]: 'OWNER' } }, order: [['username', 'ASC']] });

      let translatorMsg = 'A huge thank you to all of these translators for making this project as accessible as possible\n';
      let administratorMsg = 'These users are people that help offer higher level support for the bot\n';
      let developerMsg = 'These are the core contributors to the project\n';
      let ownerMsg = 'This is the owner of Prosperity\n';

      translators.forEach((u) => { translatorMsg += `- ${u.username}#${u.discriminator}\n`; });
      administrators.forEach((u) => { administratorMsg += `- ${u.username}#${u.discriminator}\n`; });
      developers.forEach((u) => { developerMsg += `- ${u.username}#${u.discriminator}\n`; });
      owners.forEach((u) => { ownerMsg += `- ${u.username}#${u.discriminator}\n`; });

      embed.setDescription('Prosperity is a levelling bot ready to skill up and boost up your Discord server. We pride ourselves on openness, transparency and collaboration.');
      embed.addField('Bot Statistics', `Servers: ${interaction.client.guilds.cache.size}
      Total Members: ${interaction.client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}
      Total Messages: ${totalMessageCount}`);

      embed.addField(`<:prosperity_owner:940692775454797825> Owners (${owners.length})`, ownerMsg);
      embed.addField(`<:prosperity_dev:940692660388261928> Developers (${developers.length})`, developerMsg);
      embed.addField(`<:prosperity_admin:940692667216564244> Administrators (${administrators.length})`, administratorMsg);
      embed.addField(`<:prosperity_language:940692871181381632> Translators (${translators.length})`, translatorMsg);

      interaction.reply({ embeds: [embed] });
      return;
    } catch (e) {
      Sentry.setTag('guild_id', interaction.guild?.id);
      Sentry.setTag('bot_id', interaction.applicationId);
      Sentry.setTag('user_id', interaction.user.id);
      Sentry.setTag('command', interaction.commandName);
      const errorCode = Sentry.captureException(e);
      await ReplyToInteraction(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
    }
  },
};

export default About;
