import React, { useState, useEffect } from 'react';
import styles from '../../index.module.scss';
import { Button, message } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getCurrentProject } from '../../../../../Utility';
import { getWorkbenchInfo } from '../../../../../APIs';
import WorkbenchModal from './workbenchModal';
import moment from 'moment-timezone';
import { useTranslation } from 'react-i18next';

const mapStateToProps = (state) => {
  return {
    platformRole: state.role,
    containersPermission: state.containersPermission,
    project: state.project,
  };
};

const deployedInfo = (
  platformRole,
  workbenchInfo,
  projectRole,
  setShowModal,
  setWorkbench,
  workbench,
) => {
  if (platformRole === 'admin') {
    if (workbenchInfo.deployed === false) {
      return (
        <>
          <div style={{ margin: '0px 20px' }}>
            <Button
              icon={<RocketOutlined />}
              style={{
                borderRadius: '6px',
                width: '85px',
                height: '25px',
                padding: '0px',
              }}
              onClick={() => {
                setWorkbench(workbench);
                setShowModal(true);
              }}
            >
              Deploy
            </Button>
          </div>
          <p style={{ margin: '0px', color: '#595959', fontWeight: 600 }}>
            Not yet deployed
          </p>
        </>
      );
    } else if (workbenchInfo.deployed === true) {
      const deployedBy =
        workbenchInfo.deployedBy.charAt(0).toUpperCase() +
        workbenchInfo.deployedBy.slice(1);
      const deployedDate = moment(workbenchInfo.deployedDate).format(
        'YYYY-MM-DD',
      );
      return (
        <>
          <div style={{ margin: '0px 44px 0px 65px' }}>
            <img
              alt="Approved"
              style={{ height: '15px', width: '15px' }}
              src={require('../../../../../Images/Approved.png')}
            />
          </div>
          <p style={{ margin: '0px', color: '#595959', fontWeight: 600 }}>
            Deployed for project on {deployedDate} / By: {deployedBy}
          </p>
        </>
      );
    } else {
      return null;
    }
  } else {
    if (projectRole === 'admin') {
      if (workbenchInfo.deployed === false) {
        return (
          <>
            <div style={{ margin: '0px 20px 0px 65px' }}>
              <img
                alt="Fail"
                style={{ height: '15px', width: '15px' }}
                src={require('../../../../../Images/Fail-X.png')}
              />
            </div>
            <p
              style={{
                margin: '2px 0px 0px 0px',
                color: '#595959',
                fontWeight: 600,
              }}
            >
              Not Deployed for the Project
            </p>
          </>
        );
      } else if (workbenchInfo.deployed === true) {
        const deployedBy =
          workbenchInfo.deployedBy.charAt(0).toUpperCase() +
          workbenchInfo.deployedBy.slice(1);
        const deployedDate = moment(workbenchInfo.deployedDate).format(
          'YYYY-MM-DD',
        );
        return (
          <>
            <div style={{ margin: '0px 20px 0px 65px' }}>
              <img
                alt="Approved"
                style={{ height: '15px', width: '15px' }}
                src={require('../../../../../Images/Approved.png')}
              />
            </div>
            <p
              style={{
                margin: '2px 0px 0px 0px',
                color: '#595959',
                fontWeight: 600,
              }}
            >
              Deployed for project on {deployedDate} / By: {deployedBy}
            </p>
          </>
        );
      } else {
        return null;
      }
    }
  }
};

const WorkBench = (props) => {
  const { t } = useTranslation(['errormessages', 'success']);
  const [guacamoleInfo, setGuacamoleInfo] = useState({
    deployed: '',
    deployedDate: '',
    deployedBy: '',
  });
  const [supersetInfo, setSupersetInfo] = useState({
    deployed: '',
    deployedDate: '',
    deployedBy: '',
  });
  const [jupyterhubInfo, setJupyterhubInfo] = useState({
    deployed: '',
    deployedDate: '',
    deployedBy: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [workbench, setWorkbench] = useState('');
  const datasetId = props.match.params.datasetId;
  const currentProject = getCurrentProject(datasetId);

  const getWorkbenchInformation = async () => {
    try {
      const res = await getWorkbenchInfo(currentProject?.globalEntityId);
      const workbenchKeys = Object.keys(res.data.result);
      if (workbenchKeys.length > 0) {
        if (workbenchKeys.includes('guacamole')) {
          setGuacamoleInfo({ ...res.data.result['guacamole'] });
        } else {
          setGuacamoleInfo({
            ...guacamoleInfo,
            deployed: false,
          });
        }
        if (workbenchKeys.includes('superset')) {
          setSupersetInfo({ ...res.data.result['superset'] });
        } else {
          setSupersetInfo({
            ...supersetInfo,
            deployed: false,
          });
        }
        if (workbenchKeys.includes('jupyterhub')) {
          setJupyterhubInfo({ ...res.data.result['jupyterhub'] });
        } else {
          setJupyterhubInfo({
            ...jupyterhubInfo,
            deployed: false,
          });
        }
      } else {
        setGuacamoleInfo({
          ...guacamoleInfo,
          deployed: false,
        });
        setSupersetInfo({
          ...supersetInfo,
          deployed: false,
        });
        setJupyterhubInfo({
          ...jupyterhubInfo,
          deployed: false,
        });
      }
    }catch(error) {
      message.error(t('errormessages:projectWorkench.getWorkbench.default.0'));
    }
  };

  useEffect(() => {
    getWorkbenchInformation();
  }, [props.project.workbenchDeployedCounter]);

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className={styles.workBench}>
      <div className={styles.guacamole}>
        <div style={{ width: '100px', textAlign: 'center' }}>
          <img
            style={{ width: 23, height: 23 }}
            src={require('../../../../../Images/Guacamole-Blue.svg')}
          />
        </div>
        <div style={{ width: '100px' }}>
          <span style={{ color: '#003262', fontSize: '16px', fontWeight: 600 }}>
            Guacamole
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          {deployedInfo(
            props.platformRole,
            guacamoleInfo,
            currentProject.permission,
            setShowModal,
            setWorkbench,
            'Guacamole',
          )}
        </div>
      </div>
      <div className={styles.superset}>
        <div style={{ width: '100px', textAlign: 'center' }}>
          <img
            style={{ width: 23, height: 23 }}
            src={require('../../../../../Images/SuperSet-Blue.svg')}
          />
        </div>
        <div style={{ width: '100px' }}>
          <span style={{ color: '#003262', fontSize: '16px', fontWeight: 600 }}>
            Superset
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          {deployedInfo(
            props.platformRole,
            supersetInfo,
            currentProject.permission,
            setShowModal,
            setWorkbench,
            'Superset',
          )}
        </div>
      </div>
      <div className={styles.jupyterhub}>
        <div style={{ width: '100px', textAlign: 'center' }}>
          <img
            style={{ width: 23, height: 23 }}
            src={require('../../../../../Images/Jupyter-Blue.svg')}
          />
        </div>
        <div style={{ width: '100px' }}>
          <span style={{ color: '#003262', fontSize: '16px', fontWeight: 600 }}>
            Jupyterhub
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          {deployedInfo(
            props.platformRole,
            jupyterhubInfo,
            currentProject.permission,
            setShowModal,
            setWorkbench,
            'Jupyterhub',
          )}
        </div>
      </div>
      <WorkbenchModal
        showModal={showModal}
        workbench={workbench}
        closeModal={closeModal}
        projectGeid={currentProject?.globalEntityId}
      />
    </div>
  );
};

export default connect(mapStateToProps, null)(withRouter(WorkBench));
