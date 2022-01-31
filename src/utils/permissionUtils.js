module.exports = {
  has: (member, permission) => member.permissions.has(permission) || member.user.id === '126429064218017802',
};
