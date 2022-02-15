/* eslint-disable max-len */
const clients = [];

module.exports = {
  getAllClients: () => clients,
  getClient: (botId) => clients[botId],
  addClient: (botId, client) => {
    clients[botId] = client;
  },
  removeClient: (botId) => {
    clients[botId] = null;
  },
  getTotalGuildCount: () => module.exports.getAllClients().map((c) => c.guilds.cache.size).reduce((a, g) => a + g, 0),
  getTotalMemberCount: () => module.exports.getAllClients().map((c) => c.guilds.cache.reduce((a, g) => a + g.memberCount, 0)).reduce((a, g) => a + g, 0),
};
