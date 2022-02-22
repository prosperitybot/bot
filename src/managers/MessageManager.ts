import { BaseCommandInteraction, MessageActionRow, MessageEmbed } from 'discord.js';

export const CreateEmbed = (): MessageEmbed => new MessageEmbed()
  .setColor('#0099ff')
  .setAuthor({ name: 'Prosperity', url: 'https://prosperitybot.net' });

export const ReplyToInteraction = async (
  interaction: BaseCommandInteraction,
  message: string,
  ephemeral: boolean = false,
  components: MessageActionRow[] = [],
): Promise<void> => {
  const embed: MessageEmbed = CreateEmbed()
    .setDescription(message);

  await interaction.reply({ embeds: [embed], ephemeral, components });
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
