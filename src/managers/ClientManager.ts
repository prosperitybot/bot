import { Client } from 'discord.js';

const clients: Client[] = [];

export const AddClient = (clientId: string, client: Client): void => {
  clients[clientId] = client;
};

export const RemoveClient = (clientId: string): void => {
  delete clients[clientId];
};

export const GetClient = (clientId: string): Client => clients[clientId];

export const GetAllClients = (): Client[] => clients;

export const IsWhitelabel = (client: Client): boolean => client.application?.id !== process.env.CLIENT_ID;
