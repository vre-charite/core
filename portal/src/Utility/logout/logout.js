import reduxActionWrapper from '../reduxActionWrapper';
import {
  userLogoutCreator,
  setIsLoginCreator,
  setUploadListCreator,
} from '../../Redux/actions';
import { emailUploadedFileListAPI } from '../../APIs';
import { store } from '../../Redux/store';

import { namespace, ErrorMessager } from '../../ErrorMessages';
import { message } from 'antd';
import { clearCookies, headerUpdate } from '../';
import { history } from '../../Routes';
import Cookies from 'universal-cookie';
import { q } from '../../Context';
const [
  cleanReduxDispatcher,
  setIsLoginDispatcher,
  setUploadListDispatcher,
] = reduxActionWrapper([
  userLogoutCreator,
  setIsLoginCreator,
  setUploadListCreator,
]);

const cookies = new Cookies();
function logout(cleanCookies = true) {
  if (typeof cleanCookies === 'string') {
    throw new Error('You should pass a boolean here');
  }
  const allCookies = cookies.getAll();
  const uploader = allCookies.username;
  if (!uploader) {
    /* throw new Error('username is undefined'); */
    console.error('username is undefined');
  }

  const { uploadList, clearId } = store.getState();
  // emailUploadedFileListAPI(uploadList, uploader)
  //   .then((res) => {})
  //   .catch((err) => {
  //     /* const errorMessager = new ErrorMessager(namespace.common.logout);
  //     errorMessager.triggerMsg(); */
  //   });
  if (cleanCookies) {
    Object.keys(allCookies).forEach((key) => {
      if (key !== 'cookies_notified') {
        cookies.remove(key, { path: '/' });
      }
    });
  }
  q.kill();
  console.log('logout real');
  headerUpdate('', '');
  console.log('clearId', clearId);
  window.clearInterval(clearId);
  setUploadListDispatcher([]);
  cleanReduxDispatcher();
  setIsLoginDispatcher(false);
  history.push('/');
  message.success(`Logout successful!`);
}

export default logout;
