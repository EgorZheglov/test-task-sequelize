const Joi = require('joi');
const uuid = require('uuid');

module.exports = createLessonValdiator = (data) => {
  let schema;

  const title = Joi.string();
  const firstDate = Joi.date();
  const days = Joi.array().items(Joi.number());
  const lessonsCount = Joi.number();
  const teacherIds = Joi.array().items(Joi.string());
  const lastDate = Joi.date();

  if (!data.teacherIds) {
    return { error: { details: 'teachers ids not valid' } };
  } else {
    if (!Array.isArray(data.teacherIds)) {
      return { error: { details: 'teachers ids not valid should be array' } };
    }

    if (!data.teacherIds.every((el) => uuid.validate(el))) {
      return { error: { details: 'teachers ids not valid' } };
    }
  }

  if (data.lessonsCount) {
    schema = Joi.object({
      title: title.required(),
      firstDate: firstDate.required(),
      lessonsCount: lessonsCount.required(),
      days: days.required(),
      teacherIds: teacherIds.required(),
    });
  } else if (data.lastDate) {
    schema = Joi.object({
      title: title.required(),
      firstDate: firstDate.required(),
      lastDate: lastDate.required(),
      days: days.required(),
      teacherIds: teacherIds.required(),
    });

    const firstDateData = new Date(data.firstDate);
    const lastDateData = new Date(data.lastDate);
    const diffTime = Math.abs(lastDateData - firstDateData);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 365) {
      return { error: { details: 'to big last date of lesson' } };
    }
  } else {
    return { error: { details: 'miss fields lessons count or lastDate' } };
  }

  if (!data.days.every((el) => el >= 0 && el <= 6) && data.days.length > 6) {
    return { error: { details: 'invalid days' } };
  }
  return schema.validate(data);
};
