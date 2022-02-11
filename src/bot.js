/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const Sentry = require('@sentry/node');
const { reply } = require('./utils/messages');
const { commandLogger } = require('./utils/loggingUtils');
const { deploy: deployCommands } = require('./deploy-commands');

module.exports = {
  login: (botId, botToken) => {
    const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
    // Register Commands & Menus
    client.commands = new Collection();
    client.menus = new Collection();
    client.buttonLists = new Collection();

    const commandFiles = fs.readdirSync('./src/commands').filter((file) => file.endsWith('.js'));
    const menuFiles = fs.readdirSync('./src/selectMenus').filter((file) => file.endsWith('.js'));
    const buttonListFiles = fs.readdirSync('./src/buttonLists').filter((file) => file.endsWith('.js'));

    commandFiles.forEach((file) => {
      const command = require(`./commands/${file}`);
      client.commands.set(command.data.name, command);
    });

    menuFiles.forEach((file) => {
      const menu = require(`./selectMenus/${file}`);
      client.menus.set(menu.name, menu);
    });

    buttonListFiles.forEach((file) => {
      const buttonList = require(`./buttonLists/${file}`);
      client.buttonLists.set(buttonList.name, buttonList);
    });

    const eventFiles = fs.readdirSync('./src/events').filter((file) => file.endsWith('.js'));

    eventFiles.forEach((file) => {
      const event = require(`./events/${file}`);
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
    });

    client.on('interactionCreate', async (interaction) => {
      try {
        if (interaction.isCommand()) {
          const command = client.commands.get(interaction.commandName);
          if (!command) return;

          commandLogger.info(`${interaction.user.tag} used /${interaction.commandName} in #${interaction.channel.name}`, {
            user: { name: interaction.user.tag, id: interaction.user.id },
            guild: { name: interaction.guild.name, id: interaction.guild.id },
          });
          await command.execute(interaction);
        }

        if (interaction.isSelectMenu()) {
          const menu = client.menus.get(interaction.customId);
          if (!menu) return;

          await menu.execute(interaction);
        }

        if (interaction.isButton()) {
          const buttonList = client.buttonList.get(interaction.customId.split('-')[0]);
          if (!buttonList) return;

          await buttonList.execute(interaction);
        }
        return;
      } catch (error) {
        const errorCode = Sentry.captureException(error);
        await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
      }
    });

    client.on('ready', () => {
      deployCommands(botId, botToken);
    });

    client.login(botToken);

    return client;
  },
};
