const axios = require('axios');
const rateLimit = require('axios-rate-limit');

module.exports = {
	http: rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 2000 }),
};