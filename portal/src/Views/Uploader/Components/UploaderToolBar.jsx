import React, { useState } from 'react';
import { Layout, Menu, Modal, message } from 'antd';
import { withRouter } from 'react-router-dom';
import {
  DesktopOutlined,
  UploadOutlined,
  PlusOutlined,
  ExpandOutlined,
  CheckOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import UploaderModalDataset from '../../../Components/Modals/UploaderModalDataset';
import CreateDatasetModal from '../../../Components/Modals/CreateDatasetModal';
import { connect } from 'react-redux';
import {
  createPersonalDatasetAPI,
  listAllContainersPermission,
} from '../../../APIs';
import { withCookies } from 'react-cookie';
import {
  setPersonalDatasetIdCreator,
  setContainersPermissionCreator,
} from '../../../Redux/actions';

const { Sider } = Layout;
const { SubMenu } = Menu;

function UploaderToolBar(props) {
  let [isUploaderModalDatasetShow, toggleUploaderModalDatasetShow] = useState(
    false,
  );
  let [isNewDatasetModalShow, toggleNewDatasetModalShow] = useState(false);
  const [isCreateDatasetModalShown, toggleCreateDataset] = useState(false);
  const [
    isCreatePersonalDatasetModalShown,
    toggleCreatePersonalDatasetModal,
  ] = useState(false);

  const [isCreatingPersonalDataset, toggleCreatingPersonalDataset] = useState(
    false,
  );

  //   const onClickPersonalDataset = () => {
  //     const { personalDatasetId = null } = props;
  //     if (personalDatasetId) {
  //       props.history.push(`/dataset/${personalDatasetId}/canvas`);
  //     } else {
  //       toggleCreatePersonalDatasetModal(true);
  //     }
  //   };

  //   const cancelCreatePersonalDataset = () => {
  //     toggleCreatePersonalDatasetModal(false);
  //   };

  //   const onCreatePersonalDataset = () => {
  //     toggleCreatingPersonalDataset(true);
  //     createPersonalDatasetAPI(props.allCookies.username)
  //       .then(async (res) => {
  //         const { id: personalDatasetId } = res.data.result[0];
  //         console.log(personalDatasetId, 'personalDatasetId');
  //         props.setPersonalDatasetIdCreator(personalDatasetId);

  //         const username = props.allCookies.username;
  //         const {
  //           data: { result: containersPermission },
  //         } = await listAllContainersPermission(username);

  //         props.setContainersPermissionCreator(containersPermission.permission);
  //         toggleCreatingPersonalDataset(false);
  //         message.success('Personal Container Created!');
  //         props.history.push(`/dataset/${personalDatasetId}/canvas`);
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         toggleCreatingPersonalDataset(false);
  //         message.error('failed to create personal container');
  //       });
  //   };
  return (
    <>
      <Sider collapsed={true} reverseArrow={true} trigger={null} theme="light">
        <Menu
          defaultSelectedKeys={['dashboard']}
          mode="inline"
          style={{ position: 'fixed' }}
        >
          {/* <Menu.Item
            key="uploader"
            onClick={() => {
              toggleUploaderModalDatasetShow(true);
            }}
          >
            <UploadOutlined />
            <span>File uploader</span>
          </Menu.Item> */}
          {props.role === 'admin' && (
            <Menu.Item
              key="dataset"
              onClick={() => {
                toggleCreateDataset(true);
              }}
            >
              <PlusOutlined />
              <span>New Project</span>
            </Menu.Item>
          )}

          {/* <Menu.Item key="personalDataset" onClick={onClickPersonalDataset}>
            <DatabaseOutlined />
            <span>Personal Container</span>
          </Menu.Item> */}
        </Menu>
      </Sider>
      {/* <Modal
        title="Create A Personal Container"
        visible={isCreatePersonalDatasetModalShown}
        onOk={onCreatePersonalDataset}
        confirmLoading={isCreatingPersonalDataset}
        onCancel={cancelCreatePersonalDataset}
      >
        <p>
          You don't have a personal container now. Do you want to create a
          personal container?
        </p>
      </Modal> */}
      <UploaderModalDataset
        isShown={isUploaderModalDatasetShow}
        cancel={() => {
          toggleUploaderModalDatasetShow(false);
        }}
      />

      <CreateDatasetModal
        visible={isCreateDatasetModalShown}
        cancel={() => {
          toggleCreateDataset(false);
        }}
      ></CreateDatasetModal>
    </>
  );
}

export default connect(
  (state) => ({ personalDatasetId: state.personalDatasetId, role: state.role }),
  { setContainersPermissionCreator, setPersonalDatasetIdCreator },
)(withRouter(withCookies(UploaderToolBar)));
