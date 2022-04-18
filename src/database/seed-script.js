const { createConnection, sequelize } = require('./db');
const { faker } = require('@faker-js/faker');
const { to } = require('await-to-js');
const error = 'ERROR SEED DATABASE';

//Так как дамп почему то не запускался в Dbeaver написал свои сиды для БД ;)

const path = require('path');

const config = require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});
const seedData = process.env.SEED_DATA; // чем больше это св-во - тем больше сущностей

createConnection()
  .then(async ({ Lesson, Student, Teacher }) => {
    const teachers = [];
    const students = [];

    for (let i = 0; i < seedData; i++) {
      const [err, result] = await to(
        Teacher.create({ name: faker.name.findName() })
      );
      if (err) throw error;

      if (Math.random() > 0.5 && i > 1) {
        teachers[teachers.length - 1].push(result.dataValues);
      } else {
        teachers.push([result.dataValues]);
      }
    }

    for (let i = 0; i < seedData; i++) {
      const [err, result] = await to(
        Student.create({ name: faker.name.findName() })
      );
      if (err) throw error;

      if (Math.random() > 0.5 && i > 1) {
        students[students.length - 1].push(result.dataValues);
      } else {
        students.push([result.dataValues]);
      }
    }

    for (let i = 0; i < seedData; i++) {
      const date = faker.date.past();
      const [err, result] = await to(
        Lesson.create({
          title: faker.commerce.product(),
          date: new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .split('T')[0],
          status: Math.random() > 0.5,
        }).then(async (lesson) => {
          if (teachers[i]) {
            teachers[i].forEach(async (el) => {
              await sequelize.models.lesson_teachers.create({
                teacherId: el.id,
                lessonId: lesson.id,
              });
            });
          }

          if (students[i]) {
            students[i].forEach(async (el) => {
              await sequelize.models.lesson_students.create({
                studentId: el.id,
                lessonId: lesson.id,
                visit: Math.random() > 0.5,
              });
            });
          }
          return lesson;
        })
      );

      if (err) throw err;
    }

    console.log('successfully seeded');
    await sequelize.close();
    process.exit();
  })
  .catch((e) => {
    console.log(e);
    process.exit();
  });
