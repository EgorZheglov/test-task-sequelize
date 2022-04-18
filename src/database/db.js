const { Sequelize } = require('sequelize');
const config = require('../common/config');
const modelsCreate = require('./Models/models-create');

const sequelize = new Sequelize(
  config.USER_DB,
  config.USER_DB,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: 'postgres',
    schema: config.SCHEMA,
    logging: false,
    define: {
      timestamps: false,
    },
  }
);

async function createConnection() {
  const models = await modelsCreate(sequelize);
  return models;
}

module.exports = { createConnection, sequelize };
