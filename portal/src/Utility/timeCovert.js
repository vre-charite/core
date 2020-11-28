import moment from 'moment';

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const convertUTCDateToLocalDate = (time) => {
  const date = new Date(time);
  const a = date.getTime();
  const b = date.getTimezoneOffset() * 60 * 1000;

  const c = new Date(a - b);

  return c;
};

const timeConvert = (time, type) => {
  time = time && time.replace(/ /g,"T");
  let date = convertUTCDateToLocalDate(time);
  if (type === 'date') return moment(date).format('YYYY-MM-DD');
  if (type === 'datetime') return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

export { convertUTCDateToLocalDate, timeConvert, timezone };
