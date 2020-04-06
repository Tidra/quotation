/**
 * 日期格式化
 */

function getYears(i) {
  if(i == undefined){
    i = 0;
  }
  var now = new Date();

  var year = now.getFullYear() - i;
  var month = now.getMonth() + 1;
  var day = now.getDate();

  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }
  var date = year + '-' + month + '-' + day;
  return date;
}

function getMonths(i) {
  if (i == undefined) {
    i = 0;
  }
  var now = new Date();

  var year = now.getFullYear();
  var month = now.getMonth() + 1 - i;
  var day = now.getDate();

  if(month < 1){
    month = 12 + month;
    year = year - 1;
  }

  var days = new Date(year, month, 0).getDate();
  if(day > days){
    day = days;
  }

  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }
  var date = year + '-' + month + '-' + day;
  return date;
}

module.exports = {
  getYears: getYears,
  getMonths: getMonths
}