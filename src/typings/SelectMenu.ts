import { SelectMenuInteraction } from 'discord.js';
import { BaseInteraction } from './BaseInteraction';

export interface SelectMenu extends BaseInteraction {
  name: string,
  execute: (interaction: SelectMenuInteraction) => void;
}
