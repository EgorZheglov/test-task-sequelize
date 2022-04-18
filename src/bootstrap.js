const { start } = require('../src/app');
const { createConnection } = require('./database/db');

//TODO: process errors handling
createConnection().then((res) => {
  start(3000);
});
