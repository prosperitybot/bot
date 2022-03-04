import { Client } from 'discord.js';

export interface Event {
  name: string,
  type: string,
  on: (client: Client, ...args: any) => void;
}
