import React, { Component } from 'react';
import { Card, Col, Row } from 'antd';
import { Form, Input, Button, Checkbox, message,Modal } from 'antd';
import { UserOutlined, LockOutlined,ExclamationCircleOutlined } from '@ant-design/icons';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import {
  serverAxios,
  devOpServer,
  invitationAxios,
  authServerAxios,
} from '../../APIs/config';
import styles from './index.module.scss';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { login } from '../../APIs/auth';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  AddDatasetCreator,
  setUserListCreator,
  setTagsCreator,
  setMetadatasCreator,
  setPersonalDatasetIdCreator,
  setContainersPermissionCreator,
  setUserRoleCreator,
  setRefreshModal,setIsLoginCreator
} from '../../Redux/actions';
import {
  objectKeysToCamelCase,
  apiErrorHandling,
  headerUpdate,loginChannel
} from '../../Utility';
import {
  getDatasetsAPI,
  getAllUsersAPI,
  getTagsAPI,
  getMetadatasAPI,
  getPersonalDatasetAPI,
  listAllContainersPermission,
} from '../../APIs';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import { reject } from 'async';
const {confirm} = Modal;
function getCookie(cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return undefined;
}

class Auth extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };

  onFinish = async (values) => {
    try{
      await new Promise((resolve,reject)=>{
        const {uploadList,allCookies } = this.props;
        const uploadingList = uploadList.filter(item=>item.status==='uploading');
        if(uploadingList.length===0||allCookies.username===values.username){
          resolve();
          return;
        }
        confirm({
          title: `Are you sure to log in as ${values.username}?`,
          icon: <ExclamationCircleOutlined />,
          content:
            `The file uploading is still in progress in another tab. Progress will be lost if you login as ${values.username}`,
          onOk() {
            resolve()
          },
          onCancel() {
            reject()
          },
        })
      })
    }catch(err){
      return;
    }


    login(values)
      .then((res) => {
        loginChannel.postMessage(values.username);
        const { access_token, refresh_token } = res.data.result;
        this.props.cookies.set('access_token', access_token, { path: '/' });
        this.props.cookies.set('refresh_token', refresh_token, { path: '/' });
        this.props.cookies.set('isLogin', true, { path: '/' });
        this.props.cookies.set('username', values.username, { path: '/' });

        headerUpdate(access_token);
        this.initApis(values.username);
        this.props.setIsLoginCreator(true);
        this.props.history.push('/uploader');
        message.success(`Welcome back, ${values.username}`);

/*         setInterval(() => {
          const token = getCookie('access_token');
          try {
            if (token) {
              var exp = jwt_decode(token).exp;
              const diff = exp - moment().unix() < 70; // expired after 1 min
              console.log('Auth -> componentDidMount -> diff', diff);
              if (diff) {
                this.props.setRefreshModal(true); // Pop up warning modal
              }
            }else{
              this.props.setRefreshModal(false);
            }
          } catch (e) {
            console.log(e);
          }
        }, 60000); */
      })
      .catch((err) => {
        if (err.response) {
          const errorMessager = new ErrorMessager(namespace.login.auth);
          // if (err.response.status) alert('Wrong username or password');
          errorMessager.triggerMsg(err.response.status);
        }
      });
  };

  initApis = async (username) => {
    getDatasetsAPI({ type: 'usecase' })
      .then((res) => {
        this.props.AddDatasetCreator(res.data.result, 'All Use Cases');
      })
      .catch((err) => {
        console.log(err);
        const errorMessager = new ErrorMessager(namespace.common.getDataset);
        errorMessager.triggerMsg(err.response && err.response.status);
      });
    try {
      const {
        data: { result: containersPermission },
      } = await listAllContainersPermission(username);
      this.props.setContainersPermissionCreator(
        containersPermission.permission,
      );
      this.props.setUserRoleCreator(containersPermission.role);
    } catch (err) {
      const errorMessager = new ErrorMessager(
        namespace.common.listAllContainersPermission,
      );
      errorMessager.triggerMsg(err.response && err.response.status);
    }
  };

  render() {
    return (
      <div className={styles.bg}>
        <Card className={styles.card} bodyStyle={{ padding: '10% 10%' }}>
          <Row style={{ height: '100%' }}>
            <Col span={12} className={styles.intro}>
              <div className={styles.text}>
                <p className={styles.title}>Welcome to Clinic Charité</p>
                <p className={styles.content}>
                  The Charité is a maximum care hospital that enables treatment
                  of a wide variety of diseases. Around 100 clinics and
                  institutes cover the entire spectrum of modern medicine: from
                  ophthalmology to dentistry, all medical specialties are
                  represented.
                </p>
                <Button type="ghost" className={styles.btn}>
                  Learn More
                </Button>
              </div>
            </Col>
            <Col span={12}>
              <Card
                className={styles.form}
                bodyStyle={{ textAlign: 'center', padding: '30px' }}
              >
                <img
                  src={require('../../Images/indoc-icon.png')}
                  className={styles.icon}
                  alt="icon"
                />
                <Form
                  name="normal_login"
                  className={styles['login-form']}
                  initialValues={{
                    remember: true,
                  }}
                  onFinish={this.onFinish}
                  style={{ textAlign: 'left' }}
                >
                  <Form.Item
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: 'Please input your Username!',
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="site-form-item-icon" />}
                      placeholder="Username"
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: 'Please input your Password!',
                      },
                    ]}
                  >
                    <Input
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      type="password"
                      placeholder="Password"
                      onCopy={(e) => e.preventDefault()}
                      onPaste={(e) => e.preventDefault()}
                    />
                  </Form.Item>
                  {/* <Form.Item>
                    <a className={styles["login-form-left"]} href="">
                      Forgot password
                    </a>
                  </Form.Item> */}

                  <Form.Item style={{ paddingTop: '20px' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className={styles['login-form-button']}
                    >
                      Login
                    </Button>
                    {/*  Or{" "}
                    <a>
                      {" "}
                      <Link to="/register">register now!</Link>
                    </a> */}
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}

export default withRouter(
  withCookies(
    connect(state=>({uploadList:state.uploadList}), {
      AddDatasetCreator,
      setUserListCreator,
      setTagsCreator,
      setMetadatasCreator,
      setPersonalDatasetIdCreator,
      setContainersPermissionCreator,
      setUserRoleCreator,
      setRefreshModal,setIsLoginCreator
    })(Auth),
  ),
);
