import { serverAxios as axios } from './config';

function sendEmailToAll(subject, messageBody) {
  return axios({
    url: '/v1/notification',
    method: 'POST',
    timeout: 100*1000,
    data: {
      subject: subject,
      send_to_all_active: true,
      message_body: messageBody,
    },
  });
}
export { sendEmailToAll };
