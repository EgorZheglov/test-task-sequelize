const express = require('express');
const lessons = require('./routes/lessons');

let server;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', lessons);

module.exports = {
  start: async (PORT = 3000) => {
    server = app.listen(PORT, () => {
      console.log(`Server is listening on ${PORT} port`);
    });
  },
  stop: async () => {
    //await disconnect from db
    await sequelize.close();
    server.close();
  },
};
