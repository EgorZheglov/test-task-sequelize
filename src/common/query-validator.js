const dateIsValid = require('./date-validator');
const uuid = require('uuid');

module.exports = validateQuery = (query) => {
  const result = {};
  let dates = [];
  let teachers = [];

  if (query.date) {
    dates = query.date.split(',');

    dates.forEach((date, i) => {
      if (!dateIsValid(date) || i > 1) throw 'invalid date data';
    });

    if (dates.length === 2) {
      result.firstDate = dates[0];
      result.secondDate = dates[1];
    } else {
      result.date = dates[0];
    }
  }

  if (query.teacherIds) {
    teachers = query.teacherIds.split(',');

    teachers.forEach((el) => {
      if (!uuid.validate(el)) throw 'ivalid teachers data';
    });

    result.teachers = teachers;
  }

  if (query.status) {
    if (Number.isNaN(Number(query.status))) throw 'invalid status data';

    if (Number(query.status) === 1) {
      result.status = true;
    } else {
      result.status = false;
    }
  }

  if (query.studentsCount) {
    const numbers = query.studentsCount.split(',');
    
    numbers.forEach((el, i) => {
      if (Number.isNaN(Number(el)) || i > 1)
        throw 'invalid students count data';
    });

    if (numbers.length === 1) {
      result.studentsCount = [Number(numbers[0])];
    } else {
      result.studentsCount = [Number(numbers[0]), Number(numbers[1])];
    }
  }

  if (query.page) {
    if (Number.isNaN(Number(query.page))) throw 'invalid page data';
    result.page = Number(query.page) - 1;
  } else {
    result.page = 0; //default value
  }

  if (query.lessonPerPage) {
    if (Number.isNaN(Number(query.lessonPerPage)))
      throw 'invalid lessonPerPage data';
    result.lessonPerPage = Number(query.lessonPerPage);
  } else {
    result.lessonPerPage = 15; //Default
  }

  return result;
};
