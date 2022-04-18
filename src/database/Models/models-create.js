const { DataTypes } = require('sequelize');
const config = require('../../common/config');

module.exports = async function (sequelize) {
  const Lesson = sequelize.define('lesson', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      get: function () {
        return new Date(
          this.dataValues.date.getTime() -
            this.dataValues.date.getTimezoneOffset() * 60000
        )
          .toISOString()
          .split('T')[0];
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      get: function () {
        return this.dataValues.status ? 1 : 0;
      },
    },
  });

  const Student = sequelize.define('student', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  const Teacher = sequelize.define('teacher', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  const lesson_students = sequelize.define('lesson_students', {
    visit: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  });

  Lesson.belongsToMany(Teacher, { through: 'lesson_teachers' });
  Teacher.belongsToMany(Lesson, { through: 'lesson_teachers' });
  Lesson.belongsToMany(Student, { through: lesson_students });
  Student.belongsToMany(Lesson, { through: lesson_students });

  //Проверяем наличие схемы
  await sequelize.showAllSchemas({ logging: false }).then(async (data) => {
    if (!data.includes(config.SCHEMA)) {
      await sequelize.createSchema(config.SCHEMA);
    }
    if (!data.includes(config.SCHEMA)) {
      await sequelize.createSchema(config.SCHEMA);
    }
  });

  //Проверяем соединение с пуллом
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  await sequelize.sync({ force: false });

  return { Lesson, Student, Teacher };
};
