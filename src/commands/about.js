const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Sentry = require('@sentry/node');
const { MessageLog, User } = require('@prosperitybot/database');
const { Op } = require('sequelize');
const { reply } = require('../utils/messages');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Information about the bot'),
  async execute(interaction) {
    try {
      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setAuthor({ name: 'Prosperity', url: 'https://prosperitybot.net' });

      const totalMessageCount = await MessageLog.count();
      const translators = await User.findAll({ where: { access_levels: { [Op.substring]: 'TRANSLATOR' } } });
      const administrators = await User.findAll({ where: { access_levels: { [Op.substring]: 'ADMINISTRATOR' } } });
      const developers = await User.findAll({ where: { access_levels: { [Op.substring]: 'DEVELOPER' } } });
      const owners = await User.findAll({ where: { access_levels: { [Op.substring]: 'OWNER' } } });

      let translatorMsg = 'A huge thank you to all of these translators for making this project as accessible as possible\n';
      let administratorMsg = 'These users are people that help offer higher level support for the bot';
      let developerMsg = 'These are the core contributors to the project';
      let ownerMsg = 'This is the owner of Prosperity';

      translators.forEach((u) => { translatorMsg += `- ${u.username}#${u.discriminator}\n`; });
      administrators.forEach((u) => { administratorMsg += `- ${u.username}#${u.discriminator}\n`; });
      developers.forEach((u) => { developerMsg += `- ${u.username}#${u.discriminator}\n`; });
      owners.forEach((u) => { ownerMsg += `- ${u.username}#${u.discriminator}\n`; });

      embed.setDescription('Prosperity is a levelling bot ready to skill up and boost up your Discord server. We pride ourselves on openness, transparency and collaboration.');
      embed.addField('Bot Statistics', `Servers: ${interaction.client.guilds.cache.size}\n
      Total Members: ${interaction.client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}\n
      Total Messages: ${totalMessageCount}\n`);

      embed.addField(`<:prosperity_language:940692871181381632> Translators (${translators.length})`, translatorMsg);
      embed.addField(`<:prosperity_admin:940692667216564244> Administrators (${administrators.length})`, administratorMsg);
      embed.addField(`<:prosperity_dev:940692660388261928> Developers (${developers.length})`, developerMsg);
      embed.addField(`<:prosperity_owner:940692775454797825> Owners (${owners.length})`, ownerMsg);

      await interaction.reply({
        embeds: [embed],
      });
    } catch (e) {
      Sentry.setTag('guild_id', interaction.guild.id);
      Sentry.setTag('bot_id', interaction.applicationId);
      const errorCode = Sentry.captureException(e);
      await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
    }
  },
};
