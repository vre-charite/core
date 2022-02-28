import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Row,
  Layout,
  PageHeader,
  Typography,
  Avatar,
  Tag,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  UpCircleOutlined,
  DownCircleOutlined,
} from '@ant-design/icons';
import {
  setContainersPermissionCreator,
  setCurrentProjectProfile,
  setCurrentProjectManifest,
  triggerEvent,
} from '../../../../Redux/actions';
import {
  getProjectInfoAPI,
  getUsersOnDatasetAPI,
  getAdminsOnDatasetAPI,
} from '../../../../APIs';
import { connect } from 'react-redux';
import { withCurrentProject, objectKeysToCamelCase, getTags } from '../../../../Utility';
import userRoles from '../../../../Utility/project-roles.json';
import styles from '../index.module.scss';
import { PLATFORM } from '../../../../config';
const { Content } = Layout;
const { Paragraph } = Typography;

class CanvasPageHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectUsersInfo: '',
      currentRole: '',
      pageHeaderExpand: false,
      userListOnDataset: null,
    };
  }

  initData = async () => {
    const currentProject = this.props.currentProject;
    if (currentProject?.permission) {
      this.loadAdmin();
      const projectRole = currentProject.permission;
      if (projectRole === 'admin') {
        await this.getProjectUsersInfo();
      }
      this.setState({
        currentRole: projectRole,
      });
    }
  };
  loadAdmin = async () => {
    const users = await getAdminsOnDatasetAPI(
      this.props.currentProject.globalEntityId,
    );
    const userList = objectKeysToCamelCase(users.data.result);
    this.setState({
      userListOnDataset: userList,
    });
  };

  getProjectUsersInfo = async () => {
    const usersInfo = await getUsersOnDatasetAPI(
      this.props.currentProject.globalEntityId,
    );
    if (usersInfo && usersInfo.data && usersInfo.data.result) {
      this.setState({ projectUsersInfo: usersInfo.data.result });
    }
  };
  componentDidMount() {
    this.initData();
  }
  toggleExpand = () => {
    this.setState({ pageHeaderExpand: !this.state.pageHeaderExpand });
  };
  render() {
    const { currentProject } = this.props;

    const pageHeaderExpand = this.state.pageHeaderExpand;
    const projectUsersInfo = this.state.projectUsersInfo;
    const currentRole = this.state.currentRole;
    const administrators =
      projectUsersInfo &&
      projectUsersInfo.filter((el) => el.permission === 'admin');
    const contributors =
      projectUsersInfo &&
      projectUsersInfo.filter((el) => el.permission === 'contributor');
    const collaborators =
      projectUsersInfo &&
      projectUsersInfo.filter((el) => el.permission === 'collaborator');

    // userRole refers to project role
    let userRole = this.state.currentRole;

    if (userRole === 'admin') {
      // this.props.role refers to platform role
      if (this.props.role === 'admin') {
        userRole = 'Platform Administrator';
      } else {
        userRole = 'Project Administrator';
      }
    } else {
      userRole =
        userRoles && userRoles[userRole] && userRoles[userRole]['label'];
    }
    const adminsContent = (
      <div style={{ marginTop: -8 }}>
        <div
          style={{
            lineHeight: '16px',
            marginTop: 15,
            marginBottom: 10,
            whiteSpace: 'normal',
            wordBreak: 'break-all',
          }}
        >
          <span
            style={{
              color: '#003262',
              fontSize: '12px',
              marginRight: '20px',
              fontWeight: 'normal',
            }}
          >
            Administrators
          </span>
          {this.state.userListOnDataset &&
            this.state.userListOnDataset.map((el, index) => (
              <a
                href={
                  'mailto:' +
                  el.email +
                  `?subject=[${PLATFORM} Platform: ${currentProject.name}]`
                }
                target="_blank"
                style={{ paddingRight: '5px' }}
                key={index}
              >
                <span
                  style={{
                    color: '#1F93FA',
                    fontSize: '12px',
                    marginRight: '20px',
                    fontWeight: 'normal',
                  }}
                >
                  {`${el.firstName} ${el.lastName}`}
                </span>
              </a>
            ))}
        </div>
      </div>
    );

    const title = (
      <div>
        {currentProject.name.length > 40 ? (
          <Tooltip title={currentProject.name}>
            <div style={{ marginTop: '-4px' }}>
              <span
                style={{
                  maxWidth: '100%',
                  display: 'inline-block',
                  verticalAlign: 'bottom',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: '#003262',
                  fontSize: '20px',
                }}
              >
                {currentProject.name}
              </span>
            </div>
          </Tooltip>
        ) : (
          <div style={{ marginTop: '-4px' }}>
            <span
              style={{
                maxWidth: '100%',
                display: 'inline-block',
                verticalAlign: 'bottom',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: '#003262',
                fontSize: '20px',
              }}
            >
              {currentProject.name}
            </span>
          </div>
        )}
        <div style={{ marginTop: '-12px' }}>
          <span
            style={{
              color: '#595959',
              fontSize: '12px',
              fontWeight: 'normal',
            }}
          >
            {`Project Code: ${currentProject.code} / `}
          </span>
          {userRole ? (
            <span
              style={{
                color: '#818181',
                fontSize: '12px',
                fontWeight: 'lighter',
              }}
            >
              {`Your role is ${userRole}`}
            </span>
          ) : null}
        </div>
        {currentRole && pageHeaderExpand ? adminsContent : null}
      </div>
    );

    const pageHeaderContent = (
      <Content>
        <Paragraph>
          <div style={{ height: 14, lineHeight: '14px', marginTop: -15 }}>
            <span
              style={{
                color: '#818181',
                fontSize: '12px',
              }}
            >
              Description
            </span>
          </div>
          {currentProject.description ? (
            <div>
              <p
                style={{
                  color: '#595959',
                  fontSize: '12px',
                  marginTop: 4,
                  lineHeight: '16px',
                  wordBreak: 'break-all',
                }}
              >
                {currentProject.description}
              </p>
            </div>
          ) : (
            <div>
              <p
                style={{
                  color: '#595959',
                  fontSize: '12px',
                  marginTop: 4,
                  lineHeight: '16px',
                }}
              >
                There is no description for this project.
              </p>
            </div>
          )}
        </Paragraph>
      </Content>
    );

    const tagsContent = (
      <div style={{ width: '290px', flex: '0 0 290px' }}>
        {currentRole === 'admin' && pageHeaderExpand ? (
          <div
            style={{ marginTop: '2px', textAlign: 'right', marginRight: 44 }}
          >
            <div style={{ textAlign: 'right' }}>
              <UserOutlined style={{ fontSize: '18px', color: '#1C5388' }} />
            </div>
            <div style={{ height: 35, lineHeight: '35px' }}>
              <span
                style={{
                  color: '#818181',
                  fontSize: '13px',
                  verticalAlign: 'middle',
                }}
              >
                Administrators
              </span>
              <span
                style={{
                  color: '#003262',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  verticalAlign: 'middle',
                  marginLeft: 17,
                }}
              >
                {administrators ? administrators.length : 0}
              </span>
            </div>
            <div style={{ height: 35, lineHeight: '35px' }}>
              <span
                style={{
                  color: '#818181',
                  fontSize: '13px',
                  verticalAlign: 'middle',
                }}
              >
                Contributors
              </span>
              <span
                style={{
                  color: '#003262',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  verticalAlign: 'middle',
                  marginLeft: 17,
                }}
              >
                {contributors ? contributors.length : 0}
              </span>
            </div>
            <div
              style={{ height: 35, lineHeight: '35px', marginBottom: '5px' }}
            >
              <span
                style={{
                  color: '#818181',
                  fontSize: '13px',
                  verticalAlign: 'middle',
                }}
              >
                Collaborators
              </span>
              <span
                style={{
                  color: '#003262',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  verticalAlign: 'middle',
                  marginLeft: 17,
                }}
              >
                {collaborators ? collaborators.length : 0}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ height: '26px' }}></div>
        )}
        <div
          style={{
            display: 'block',
            marginRight: '44px',
            lineHeight: '35px',
            textAlign: 'right',
          }}
        >
          {currentProject.tags && getTags(currentProject.tags)}
        </div>
      </div>
    );

    const showTagsContent = (role, expand) => {
      if (currentRole !== 'admin' && expand) {
        return (
          <div>
            <div style={{ height: '50px' }}></div>
            {tagsContent}
          </div>
        );
      } else {
        return tagsContent;
      }
    };

    const avatar = currentProject.icon ? (
      <Avatar
        shape="circle"
        src={currentProject.icon && currentProject.icon}
        style={{ border: '#003262', borderWidth: '1px', width: 36, height: 36 }}
      ></Avatar>
    ) : (
      <Avatar
        shape="circle"
        style={{ border: '#003262', borderWidth: '1px', width: 36, height: 36 }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        >
          {currentProject.name ? currentProject.name.charAt(0) : ''}
        </span>
      </Avatar>
    );

    return (
      <div style={{ margin: '-20px -20px -20px -18px', position: 'relative' }}>
        <Row>
          <Content
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              paddingTop: 19,
              paddingBottom: 13,
            }}
          >
            <div
              style={{
                width: '100%',
                paddingLeft: 18,
                display: 'flex',
                overflow: 'hidden',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '8px 0 0 0',
                    marginLeft: 8,
                  }}
                >
                  {avatar}
                </div>
                <div
                  style={{
                    paddingLeft: 15,
                    width: '100%',
                    flex: 1,
                    overflow: 'hidden',
                  }}
                >
                  <PageHeader
                    ghost={true}
                    style={{
                      width: '100%',
                      height: '100%',
                      padding: '0px 0px 0px 0px',
                    }}
                    title={title}
                  >
                    {pageHeaderExpand && pageHeaderContent}
                  </PageHeader>
                </div>
              </div>
              {showTagsContent(currentRole, pageHeaderExpand)}
            </div>
            <div style={{ position: 'absolute', right: 10, bottom: -10 }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  zIndex: 1,
                }}
              ></div>
              {pageHeaderExpand ? (
                <UpCircleOutlined
                  onClick={this.toggleExpand}
                  style={{
                    color: '#1890FF',
                    fontSize: '22px',
                    zIndex: 2,
                    position: 'relative',
                  }}
                />
              ) : (
                <DownCircleOutlined
                  onClick={this.toggleExpand}
                  style={{
                    color: '#1890FF',
                    fontSize: '22px',
                    zIndex: 2,
                    position: 'relative',
                  }}
                />
              )}
            </div>
          </Content>
        </Row>
      </div>
    );
  }
}

export default connect(
  (state) => ({
    role: state.role,
  }),
  {
    setCurrentProjectManifest,
    setCurrentProjectProfile,
    triggerEvent,
  },
)(withCurrentProject(withRouter(CanvasPageHeader)));
