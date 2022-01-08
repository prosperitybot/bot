module.exports = {
	getXpNeeded: (level) => {
		return 5 / 6 * level * (2 * level * level + 27 * level + 91);
	},
};