import {
  CommandInteraction, ChatInputApplicationCommandData, Client,
} from 'discord.js';
import { BaseInteraction } from './BaseInteraction';

export interface Command extends BaseInteraction {
  data: ChatInputApplicationCommandData,
  ownerOnly: Boolean,
  run: (client: Client, interaction: CommandInteraction) => void;
}
