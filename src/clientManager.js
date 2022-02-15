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
  getTotalGuildCount: () => {
    let guildCount = 0;
    module.exports.getAllClients().forEach((client) => {
      guildCount += client.guilds.cache.size;
    });

    return guildCount;
  },
  getTotalMemberCount: () => {
    let memberCount = 0;
    module.exports.getAllClients().forEach((client) => {
      memberCount += client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
    });

    return memberCount;
  },
};
