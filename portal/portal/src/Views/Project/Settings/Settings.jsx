import React, { useState, useEffect } from 'react';
import { message, Tabs, Row, Col, Layout, Card, Button } from 'antd';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  withCurrentProject,
  trimString,
  objectKeysToSnakeCase,
  objectKeysToCamelCase,
} from '../../../Utility';
import styles from './index.module.scss';
import GeneralInfo from './Tabs/GeneralInfo/GeneralInfo';
import FileManifest from './Tabs/FileManifest/FileManifest';
import WorkBench from './Tabs/workBench/workBench';
import CanvasPageHeader from '../Canvas/PageHeader/CanvasPageHeader';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  setContainersPermissionCreator,
  UpdateDatasetCreator,
} from '../../../Redux/actions';
import {
  updateDatasetInfoAPI,
  getProjectInfoAPI,
  getAdminsOnDatasetAPI,
} from '../../../APIs';
const { Content } = Layout;
const { TabPane } = Tabs;
function Settings(props) {
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { containersPermission } = useSelector((state) => state);
  const { t } = useTranslation(['formErrorMessages']);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [userListOnDataset, setUserListOnDataset] = useState(null);
  const [activateKey, setActivateKey] = useState('general_info');
  let { datasetId } = useParams();
  const [datasetUpdate, setDatasetUpdate] = useState(null);
  const curProject = props.currentProject;

  const saveDatasetInfo = () => {
    // check information (name is required)
    setIsSaving(true);
    if (
      !datasetUpdate['name'] ||
      trimString(datasetUpdate['name']).length === 0
    ) {
      message.error(t('formErrorMessages:project.card.save.name.empty'));
      setIsSaving(false);
      return;
    }

    if (datasetUpdate['name'] && datasetUpdate['name'].length > 100) {
      message.error(t('formErrorMessages:project.card.save.name.valid'));
      setIsSaving(false);
      return;
    }

    const tags = datasetUpdate['tags'];
    let isTagContainSpace = false;
    isTagContainSpace = tags && tags.filter((el) => (el + '').includes(' '));
    if (isTagContainSpace && isTagContainSpace.length) {
      message.error({
        content: `${t('formErrorMessages:project.card.update.tags.space')}`,
        style: { marginTop: '20vh' },
        duration: 5,
      });
      setIsSaving(false);
      return;
    }

    let isTagError = tags && tags.some((el) => el.length > 32);
    if (isTagError) {
      message.error(`${t('formErrorMessages:project.card.save.tags.valid')}`);
      setIsSaving(false);
      return;
    }

    if (datasetUpdate['description']) {
      datasetUpdate['description'] = trimString(datasetUpdate['description']);
    }
    if (
      datasetUpdate['description'] &&
      datasetUpdate['description'].length > 250
    ) {
      message.error(t('formErrorMessages:project.card.save.description.valid'));
      setIsSaving(false);
      return;
    }

    let data2Update = {};

    for (const key in datasetUpdate) {
      if (
        ![
          'timeCreated',
          'timeLastmodified',
          'time_created',
          'time_lastmodified',
        ].includes(key)
      ) {
        data2Update[key] = datasetUpdate[key];
      }
    }
    const updateContainerPremission = async (containersPermission) => {
      dispatch(setContainersPermissionCreator(containersPermission));
    };
    delete data2Update['icon'];

    // call API to update project info
    updateDatasetInfoAPI(
      curProject.globalEntityId,
      objectKeysToSnakeCase(data2Update),
    ).then((res) => {
      let newDataInfo = res.data.result[0];
      const newContainerPermission = containersPermission.map((el) => {
        if (el.id === parseInt(datasetId)) {
          return {
            ...el,
            name: newDataInfo.name,
          };
        }
        return el;
      });
      updateContainerPremission(newContainerPermission);
      data2Update['icon'] = newDataInfo['icon'];
      setDatasetInfo(data2Update);
      setTimeout(() => {
        setEditMode(false);
        setIsSaving(false);
      }, 500);
    });
  };

  useEffect(() => {
    async function loadProject() {
      const res = await getProjectInfoAPI(props.currentProject.globalEntityId);
      if (res.status === 200 && res.data && res.data.code === 200) {
        const currentDataset = res.data.result;
        setDatasetInfo(currentDataset);
        setDatasetUpdate(currentDataset);
      }
      const users = await getAdminsOnDatasetAPI(curProject.globalEntityId);
      setUserListOnDataset(objectKeysToCamelCase(users.data.result));
    }
    loadProject();
  }, [datasetId]);

  const updateDatasetInfo = (field, value) => {
    if (field === 'tags') {
      let isTagInvalid = true;

      isTagInvalid = value && value.some((el) => el.includes(' '));

      if (isTagInvalid) {
        message.error(t('formErrorMessages:project.card.update.tags.space'));
      }

      isTagInvalid = value && value.some((el) => el.length > 32);

      if (isTagInvalid) {
        message.error(t('formErrorMessages:project.card.update.tags.valid'));
      }
    }

    if (field === 'name') {
      let isNameInvalid = value.length > 100;
      if (isNameInvalid) {
        message.error(t('formErrorMessages:project.card.update.name.valid'));
      }
    }

    setDatasetUpdate({ ...datasetUpdate, [field]: value });
  };
  const tabBarExtraContent = editMode ? (
    <>
      <Button
        loading={isSaving}
        onClick={saveDatasetInfo}
        style={{ marginRight: 10 }}
        className={styles.button}
        type="primary"
        icon={<SaveOutlined />}
      >
        Save
      </Button>
      <Button
        onClick={() => {
          setEditMode(false);
          // reset dataset to be same with datasetInfo
          setDatasetUpdate({ ...datasetInfo });
        }}
        type="link"
      >
        Cancel
      </Button>
    </>
  ) : (
    <Button
      style={{ color: '#595959' }}
      onClick={() => {
        setEditMode(true);
      }}
      type="link"
      icon={<EditOutlined />}
    >
      Edit
    </Button>
  );
  return (
    <>
      <Content className={'content'}>
        <CanvasPageHeader />
        <Card className={styles.card_wrapper} style={{ marginTop: 30 }}>
          <Tabs
            activeKey={activateKey}
            onChange={(activateKey) => setActivateKey(activateKey)}
            tabBarExtraContent={
              activateKey === 'general_info' && tabBarExtraContent
            }
            renderTabBar={(props, DefaultTabBar) => {
              return (
                <DefaultTabBar
                  className={styles.tabHeader}
                  {...props}
                  style={{ paddingLeft: 16 }}
                />
              );
            }}
            className={styles.custom_tabs}
          >
            <TabPane tab="General Information" key="general_info">
              <div style={{ backgroundColor: 'white' }}>
                <GeneralInfo
                  userListOnDataset={userListOnDataset}
                  updateDatasetInfo={updateDatasetInfo}
                  saveDatasetInfo={saveDatasetInfo}
                  editMode={editMode}
                  datasetInfo={datasetInfo}
                  setEditMode={setEditMode}
                  datasetUpdate={datasetUpdate}
                  setDatasetInfo={setDatasetInfo}
                />
              </div>
            </TabPane>
            <TabPane tab="File Attributes" key="file_manifest">
              <div style={{ backgroundColor: 'white' }}>
                <FileManifest />
              </div>
            </TabPane>
            <TabPane tab="Workbench" key="work_bench">
              <div style={{ backgroundColor: 'white' }}>
                <WorkBench />
              </div>
            </TabPane>
          </Tabs>
        </Card>
      </Content>
    </>
  );
}
export default withCurrentProject(Settings);
