import { ButtonInteraction } from 'discord.js';
import { BaseInteraction } from './BaseInteraction';

export interface ButtonList extends BaseInteraction {
  name: string,
  execute: (interaction: ButtonInteraction) => void;
}
