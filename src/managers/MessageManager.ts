import {
  BaseCommandInteraction, ButtonInteraction, DMChannel, Message, MessageActionRow, MessageEmbed, SelectMenuInteraction, TextBasedChannel,
} from 'discord.js';

export const CreateEmbed = (): MessageEmbed => new MessageEmbed()
  .setColor('#0099ff')
  .setAuthor({ name: 'Prosperity', url: 'https://prosperitybot.net' });

export const ReplyToInteraction = async (
  interaction: BaseCommandInteraction | SelectMenuInteraction | ButtonInteraction,
  message: string,
  ephemeral: boolean = false,
  components: MessageActionRow[] = [],
): Promise<void> => {
  const embed: MessageEmbed = CreateEmbed()
    .setDescription(message);

  await interaction.reply({ embeds: [embed], ephemeral, components });
};

export const ReplyToMessage = async (
  message: Message,
  messageToSend: string,
  components: MessageActionRow[] = [],
): Promise<void> => {
  const embed: MessageEmbed = CreateEmbed()
    .setDescription(messageToSend);

  await message.reply({ embeds: [embed], components });
};

export const SendMessage = async (
  channel: TextBasedChannel | DMChannel,
  messageToSend: string,
  components: MessageActionRow[] = [],
): Promise<void> => {
  const embed: MessageEmbed = CreateEmbed()
    .setDescription(messageToSend);

  await channel.send({ embeds: [embed], components });
};

export const EditReplyToInteraction = async (
  interaction: BaseCommandInteraction,
  message: string,
  components: MessageActionRow[] = [],
): Promise<void> => {
  const embed: MessageEmbed = CreateEmbed()
    .setDescription(message);

  await interaction.editReply({ embeds: [embed], components });
};
