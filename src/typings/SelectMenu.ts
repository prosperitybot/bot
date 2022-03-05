import { SelectMenuInteraction } from 'discord.js';

export interface SelectMenu {
  name: string,
  execute: (interaction: SelectMenuInteraction) => void;
}
