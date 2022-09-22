// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

import moment from 'moment';

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const convertUTCDateToLocalDate = (time) => {
  const date = new Date(time);
  const a = date.getTime();
  const b = date.getTimezoneOffset() * 60 * 1000;

  const c = new Date(a - b);

  return c;
};

const formatDate = (utc) => {
  const date = convertUTCDateToLocalDate(utc);
  if (!isNaN(date)) {
    const t = moment.tz.guess();
    const timezone = moment.tz(t).zoneAbbr();
    utc = moment(date).format('MMMM DD, YYYY - HH:mm') + ' ' + timezone;
  }
  return utc;
};

const curTimeZoneAbbr = () => {
  const t = moment.tz.guess();
  const timezone = moment.tz(t).zoneAbbr();
  return timezone;
};

const timeConvert = (time, type) => {
  time = time && time.replace(/ /g, 'T');
  let date = convertUTCDateToLocalDate(time);
  if (type === 'date') return moment(date).format('YYYY-MM-DD');
  if (type === 'datetime') return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

const CalTimeDiff = (targetTime) => {
  if (targetTime === null) {
    return 'Invalid Timestamp';
  }
  if (targetTime === 0) {
    return '';
  }
  const currentTime = new Date().getTime();
  const timeStampDiff = currentTime - targetTime * 1000;
  const calculatedTimeDiff = timeStampDiff / (1000 * 3600); //based by hour

  if (calculatedTimeDiff > 0 && calculatedTimeDiff < 1) {
    return `${calculatedTimeDiff.toFixed(1) * 60} ${
      calculatedTimeDiff.toFixed(1) > 0 ? 'minutes' : 'minute'
    } ago`;
  } else if (calculatedTimeDiff >= 1 && calculatedTimeDiff < 24) {
    return `${Math.round(calculatedTimeDiff)} ${
      Math.round(calculatedTimeDiff) > 1 ? 'hours' : 'hour'
    } ago`;
  } else if (calculatedTimeDiff >= 24 && calculatedTimeDiff < 720) {
    return `${Math.round(calculatedTimeDiff / 24)} ${
      Math.round(calculatedTimeDiff / 24) > 1 ? 'days' : 'day'
    } ago`;
  } else if (calculatedTimeDiff >= 720 && calculatedTimeDiff < 8640) {
    return `${Math.round(calculatedTimeDiff / 24 / 30)} ${
      Math.round(calculatedTimeDiff / 24 / 30) > 1 ? 'months' : 'month'
    } ago`;
  } else {
    return `${Math.round(calculatedTimeDiff / 24 / 30 / 12)} ${
      Math.round(calculatedTimeDiff / 24 / 30 / 12) > 1 ? 'years' : 'year'
    } ago`;
  }
};

export {
  convertUTCDateToLocalDate,
  timeConvert,
  formatDate,
  curTimeZoneAbbr,
  timezone,
  CalTimeDiff,
};
