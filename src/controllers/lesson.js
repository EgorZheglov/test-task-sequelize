const { sequelize } = require('../database/db');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const { to } = require('await-to-js');
const { array } = require('joi');

async function findLessons(payload) {
  const contidtions = {};
  const teacherConditions = {
    model: sequelize.models.teacher,
    through: {
      attributes: [],
    },
  };

  if (payload.firstDate && payload.secondDate) {
    contidtions.date = {
      [Op.between]: [new Date(payload.firstDate), new Date(payload.secondDate)],
    };
  } else if (payload.date) {
    contidtions.date = { [Op.eq]: new Date(payload.date) };
  }

  if (payload.status) contidtions.status = payload.status;

  if (payload.teachers && payload.teachers.length > 1) {
    teacherConditions.where = {
      id: {
        [Op.or]: payload.teachers,
      },
    };
  } else if (payload.teachers && payload.teachers.length === 1) {
    teacherConditions.where = { id: payload.teachers[0] };
  }

  if (payload.studentsCount && payload.studentsCount.length === 2) {
    contidtions[Op.and] = [
      Sequelize.literal(
        `(SELECT COUNT(*) FROM lesson_students WHERE lesson_students."lessonId" = lesson.id) BETWEEN ${payload.studentsCount[0]} AND ${payload.studentsCount[1]}`
      ),
    ];
  } else if (payload.studentsCount) {
    contidtions[Op.and] = [
      Sequelize.literal(
        `(SELECT COUNT(*) FROM lesson_students WHERE lesson_students."lessonId" = lesson.id) = ${payload.studentsCount}`
      ),
    ];
  }

  const [err, res] = await to(
    sequelize.models.lesson.findAll({
      limit: payload.lessonPerPage,
      offset: payload.page,
      where: contidtions,
      attributes: [
        'date',
        'status',
        'id',
        'title',
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM lesson_students WHERE lesson_students."lessonId" = lesson.id AND visit = true)'
          ),
          'studentsCount',
        ],
      ],
      include: [
        teacherConditions,
        {
          model: sequelize.models.student,
          through: {
            attributes: [],
          },
        },
      ],
    })
  );

  if (err) throw err;

  return res;
}

async function createLesson(payload) {
  const bulk = [];

  if (payload.lastDate) {
    const startOfWeek = new Date(
      new Date(payload.firstDate - payload.firstDate.getDay())
        .toISOString()
        .split('T')[0]
    );

    payload.days.forEach((day) => {
      const date = new Date(startOfWeek);
      let counter = 0;
      date.setDate(date.getDate() + day);

      while (date < payload.lastDate && bulk.length < 300) {
        if (date > payload.firstDate && date < payload.lastDate) {
          const data = { title: payload.title, date: new Date(date) };
          bulk.push(data);
          date.setDate(date.getDate() + 7);
        }

        if (counter > 300) throw 'unknown error in buld create by last date';
        counter++;
      }
    });
  }

  if (payload.lessonsCount) {
    const startOfWeek = new Date(
      new Date(payload.firstDate - payload.firstDate.getDay())
        .toISOString()
        .split('T')[0]
    );

    let counter = 0;
    while (counter < payload.lessonsCount && counter < 300) {
      payload.days.forEach((day) => {
        const data = {
          title: payload.title,
          date: new Date(
            new Date(startOfWeek).setDate(startOfWeek.getDate() + day)
          ),
        };

        if (counter >= payload.lessonsCount && counter > 300) {
          return;
        } else {
          bulk.push(data);
          counter++;
        }
      });

      startOfWeek.setDate(startOfWeek.getDate() + 7);
    }
    bulk.length = payload.lessonsCount;
  }

  const [err, result] = await to(
    sequelize.models.lesson.bulkCreate(bulk).then(async (lessons) => {
      await payload.teacherIds.forEach(async (teacherid) => {
        const lessonsTeacherBulk = lessons.map((el) => {
          return { lessonId: el.id, teacherId: teacherid };
        });
        const [err, res] = await to(
          sequelize.models.lesson_teachers.bulkCreate(lessonsTeacherBulk)
        );

        if (!err) return res;
      });

      //Наверное, не самое лучшее решение, но с данной ORM - это мой первый опыт
      return lessons.map((el) => el.id);
    })
  );

  if (err) throw err;

  return result;
}

module.exports = {
  createLesson,
  findLessons,
};
