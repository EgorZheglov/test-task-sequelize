const path = require('path');

const config = require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = config.parsed;