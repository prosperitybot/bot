import {
  BaseCommandInteraction, ButtonInteraction, DMChannel, Message, MessageActionRow, MessageEmbed, SelectMenuInteraction, TextBasedChannel,
} from 'discord.js';

export const CreateEmbed = (whitelabelBot: boolean = false): MessageEmbed => {
  const embed = new MessageEmbed()
    .setColor('#0099ff');

  if (whitelabelBot === true) {
    embed.setFooter({ text: 'Powered by ProsperityBot.net' });
  } else {
    embed.setAuthor({ name: 'Prosperity', url: 'https://prosperitybot.net' });
  }

  return embed;
};

export const ReplyToInteraction = async (
  interaction: BaseCommandInteraction | SelectMenuInteraction | ButtonInteraction,
  message: string,
  ephemeral: boolean = false,
  whitelabelBot: boolean = false,
  components: MessageActionRow[] = [],
): Promise<void> => {
  const embed: MessageEmbed = CreateEmbed(whitelabelBot)
    .setDescription(message);

  await interaction.reply({ embeds: [embed], ephemeral, components });
};

export const ReplyToMessage = async (
  message: Message,
  messageToSend: string,
  whitelabelBot: boolean = false,
  components: MessageActionRow[] = [],
): Promise<void> => {
  const embed: MessageEmbed = CreateEmbed(whitelabelBot)
    .setDescription(messageToSend);

  await message.reply({ embeds: [embed], components });
};

export const SendMessage = async (
  channel: TextBasedChannel | DMChannel,
  messageToSend: string,
  whitelabelBot: boolean = false,
  components: MessageActionRow[] = [],
): Promise<void> => {
  const embed: MessageEmbed = CreateEmbed(whitelabelBot)
    .setDescription(messageToSend);

  await channel.send({ embeds: [embed], components });
};

export const EditReplyToInteraction = async (
  interaction: BaseCommandInteraction,
  message: string,
  whitelabelBot: boolean = false,
  components: MessageActionRow[] = [],
): Promise<void> => {
  const embed: MessageEmbed = CreateEmbed(whitelabelBot)
    .setDescription(message);

  await interaction.editReply({ embeds: [embed], components });
};
