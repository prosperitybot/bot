const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Sentry = require('@sentry/node');
const { MessageLog, User } = require('@prosperitybot/database');
const { Op } = require('sequelize');
const { reply } = require('../utils/messages');
const clientManager = require('../clientManager');

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
      const translators = await User.findAll({ where: { access_levels: { [Op.substring]: 'TRANSLATOR' } }, order: [['username', 'ASC']] });
      const administrators = await User.findAll({ where: { access_levels: { [Op.substring]: 'ADMINISTRATOR' } }, order: [['username', 'ASC']] });
      const developers = await User.findAll({ where: { access_levels: { [Op.substring]: 'DEVELOPER' } }, order: [['username', 'ASC']] });
      const owners = await User.findAll({ where: { access_levels: { [Op.substring]: 'OWNER' } }, order: [['username', 'ASC']] });

      let translatorMsg = 'A huge thank you to all of these translators for making this project as accessible as possible\n';
      let administratorMsg = 'These users are people that help offer higher level support for the bot\n';
      let developerMsg = 'These are the core contributors to the project\n';
      let ownerMsg = 'This is the owner of Prosperity\n';

      translators.forEach((u) => { translatorMsg += `- ${u.username}#${u.discriminator}\n`; });
      administrators.forEach((u) => { administratorMsg += `- ${u.username}#${u.discriminator}\n`; });
      developers.forEach((u) => { developerMsg += `- ${u.username}#${u.discriminator}\n`; });
      owners.forEach((u) => { ownerMsg += `- ${u.username}#${u.discriminator}\n`; });

      let guildCount = 0;
      clientManager.getAllClients().forEach((client) => {
        guildCount += client.guilds.cache.size;
      });

      embed.setDescription('Prosperity is a levelling bot ready to skill up and boost up your Discord server. We pride ourselves on openness, transparency and collaboration.');
      embed.addField('Bot Statistics', `Servers: ${guildCount}
      Total Members: ${clientManager.getTotalMemberCount()}
      Total Messages: ${totalMessageCount}`);

      embed.addField(`<:prosperity_owner:940692775454797825> Owners (${owners.length})`, ownerMsg);
      embed.addField(`<:prosperity_dev:940692660388261928> Developers (${developers.length})`, developerMsg);
      embed.addField(`<:prosperity_admin:940692667216564244> Administrators (${administrators.length})`, administratorMsg);
      embed.addField(`<:prosperity_language:940692871181381632> Translators (${translators.length})`, translatorMsg);

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
