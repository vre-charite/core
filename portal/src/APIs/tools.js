import { serverAxios as axios } from './config';

function sendEmailToAll(subject, messageBody) {
  return axios({
    url: '/v1/email',
    method: 'POST',
    timeout: 100 * 1000,
    data: {
      subject: subject,
      send_to_all_active: true,
      message_body: messageBody,
    },
  });
}

function sendEmails(subject, messageBody, emails) {
  return axios({
    url: '/v1/email',
    method: 'POST',
    timeout: 100 * 1000,
    data: {
      subject: subject,
      send_to_all_active: false,
      message_body: messageBody,
      emails: emails,
    },
  });
}
export { sendEmailToAll, sendEmails };
