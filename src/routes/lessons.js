const express = require('express');
const { to } = require('await-to-js');

const validateQuery = require('../common/query-validator');
const { sequelize } = require('../database/db');
const createLessonValdiator = require('../common/lesson-validator');
const { createLesson, findLessons } = require('../controllers/lesson');

const lessons = express.Router();

lessons.get('/', async (req, res, next) => {
  let payload;
  try {
    payload = validateQuery(req.query);
  } catch (e) {
    res.status(400).send({ message: e });
    return;
  }

  const [err, result] = await to(findLessons(payload));

  if (err) return res.status(500).send({ message: 'server error' });

  res.status(200).send(result);
});

lessons.post('/', async (req, res, next) => {
  const payload = createLessonValdiator(req.body);
  if (payload.error) {
    return res.status(400).send(payload.error.details);
  }

  const [err, result] = await to(createLesson(payload.value));

  if (err) return res.status(500).send({ message: 'server error' });

  return res.status(200).send(result);
});

module.exports = lessons;
