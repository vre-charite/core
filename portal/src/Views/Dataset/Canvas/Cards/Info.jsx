import React, { useState, useEffect } from 'react';
import {
  Descriptions,
  Tag,
  Button,
  Input,
  Select,
  Checkbox,
  message,
  Typography,
  Row,
  Space,
} from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import {
  updateDatasetInfoAPI,
  getAdminsOnDatasetAPI,
  getProjectInfoAPI,
} from '../../../../APIs';
import { UpdateDatasetCreator } from '../../../../Redux/actions';
import {
  useCurrentProject,
  objectKeysToSnakeCase,
  timeConvert,
  trimString,
  reduxActionWrapper,
} from '../../../../Utility';
import { Link } from 'react-router-dom';
import { objectKeysToCamelCase } from '../../../../Utility';
import { useTranslation } from 'react-i18next';
import {
  setContainersPermissionCreator,
  setCurrentProjectProfile,
  setCurrentProjectManifest,
  triggerEvent,
} from '../../../../Redux/actions';
import { useSelector, useDispatch } from 'react-redux';
const { TextArea } = Input;
const { Paragraph } = Typography;

function Description(props) {
  const project = useSelector((state) => state.project);

  const [editView, setEditView] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState(
    project ? project.profile : null,
  );
  const [datasetUpdate, setDatasetUpdate] = useState(
    project ? project.profile : null,
  );
  const [userListOnDataset, setUserListOnDataset] = useState(null);
  const [tagErrorMsg, setTagErrorMsg] = useState(null);
  // eslint-disable-next-line
  const [nameErrorMsg, setNameErrorMsg] = useState(null);
  const { t } = useTranslation(['formErrorMessages']);
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch();
  const {
    containersPermission,
    match: {
      params: { datasetId },
    },
    datasetList,
  } = props;

  const [setContainersPermissionDispatcher] = reduxActionWrapper([
    setContainersPermissionCreator,
  ]);

  useEffect(() => {
    dispatch(
      setCurrentProjectManifest({
        tags: datasetInfo && datasetInfo.systemTags,
      }),
    );
    dispatch(triggerEvent('LOAD_COPY_LIST'));
    dispatch(triggerEvent('LOAD_DELETED_LIST'));
    getProjectInfoAPI(datasetId).then((res) => {
      if (res.status === 200 && res.data && res.data.code === 200) {
        const currentDataset = res.data.result;
        dispatch(setCurrentProjectProfile(currentDataset));
        setDatasetInfo(currentDataset);
        setDatasetUpdate(currentDataset);
      }
    });
    // eslint-disable-next-line
  }, [containersPermission, datasetList, datasetId]);

  const [currentContainer] = useCurrentProject();

  useEffect(() => {
    currentContainer &&
      getAdminsOnDatasetAPI(datasetId).then((res) => {
        setUserListOnDataset(objectKeysToCamelCase(res.data.result));
      });
    // eslint-disable-next-line
  }, [null]);

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
    isTagContainSpace = tags && tags.filter((el) => el.includes(' '));
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

    // call API to update project info
    updateDatasetInfoAPI(datasetId, objectKeysToSnakeCase(data2Update))
      .then((res) => {
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
        setEditView(false);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const updateContainerPremission = async (containersPermission) => {
    setContainersPermissionDispatcher(containersPermission);
  };

  const updateDatasetInfo = (field, value) => {
    if (field === 'tags') {
      let isTagInvalid = true;

      isTagInvalid = value && value.some((el) => el.includes(' '));

      if (isTagInvalid) {
        message.error(t('formErrorMessages:project.card.update.tags.space'));
        setTagErrorMsg(t('formErrorMessages:project.card.update.tags.space'));
      } else {
        setTagErrorMsg(null);
      }

      isTagInvalid = value && value.some((el) => el.length > 32);
      if (isTagInvalid) {
        message.error(t('formErrorMessages:project.card.update.tags.valid'));
        setTagErrorMsg(t('formErrorMessages:project.card.update.tags.valid'));
      }
    }

    if (field === 'name') {
      let isNameInvalid = value.length > 100;
      if (isNameInvalid) {
        message.error(t('formErrorMessages:project.card.update.name.valid'));
        setNameErrorMsg(t('formErrorMessages:project.card.update.name.valid'));
      } else {
        setNameErrorMsg(null);
      }
    }

    setDatasetUpdate({ ...datasetUpdate, [field]: value });
  };

  function tagRender(props) {
    const { label, closable, onClose } = props;

    return (
      <Tag
        color="cyan"
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {label}
      </Tag>
    );
  }

  const tagsErrorMsg = (
    <Row>
      <span style={{ padding: 10, marginBottom: -10, color: 'red' }}>
        {tagErrorMsg}
      </span>
    </Row>
  );

  let selectStyle = { width: '100%' };

  if (tagErrorMsg) {
    selectStyle = {
      width: '100%',
      borderColor: 'red',
    };
  }
  const printDetails = () => {
    if (datasetInfo) {
      return (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '2px',
              alignItems: 'baseline',
            }}
          >
            <p>
              <small>
                Created on {timeConvert(datasetInfo.timeCreated, 'date')} |
                Project code: {datasetInfo.code}
              </small>
            </p>
            {!currentContainer ||
            currentContainer['permission'] !== 'admin' ? null : editView ? (
              <Space>
                <Button
                  disabled={isSaving}
                  type="link"
                  onClick={(e) => {
                    setEditView(false);
                    setDatasetInfo(datasetInfo);
                    setDatasetUpdate(datasetInfo);
                    setTagErrorMsg(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  loading={isSaving}
                  type="primary"
                  onClick={saveDatasetInfo}
                >
                  Save
                </Button>
              </Space>
            ) : (
              <Link to="settings">
                <SettingOutlined />
              </Link>
              // <Button onClick={(e) => setEditView(true)}>Edit</Button>
            )}
          </div>

          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Project Name">
              {editView ? (
                <Input
                  defaultValue={datasetInfo.name}
                  onChange={(e) =>
                    updateDatasetInfo('name', _.trimStart(e.target.value))
                  }
                />
              ) : (
                <>{datasetInfo.name}</>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Visibility" span={1}>
              {editView ? (
                <Checkbox
                  defaultChecked={datasetInfo.discoverable}
                  onChange={(e) =>
                    updateDatasetInfo('discoverable', e.target.checked)
                  }
                  style={{ paddingLeft: '10px' }}
                >
                  Discoverable by all platform users
                </Checkbox>
              ) : (
                <>
                  {datasetInfo.discoverable
                    ? 'Discoverable by all platform users'
                    : 'Only discoverable by project members'}
                </>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Tags" span={1}>
              {editView ? (
                <div>
                  <Row>
                    <Select
                      mode="tags"
                      defaultValue={datasetInfo.tags ? datasetInfo.tags : []}
                      style={{ ...selectStyle }}
                      onChange={(value) => updateDatasetInfo('tags', value)}
                      tagRender={tagRender}
                    >
                      {datasetInfo.tags ? datasetInfo.tags : []}
                    </Select>
                  </Row>

                  {tagErrorMsg && tagsErrorMsg}
                </div>
              ) : (
                <>
                  {datasetInfo.tags &&
                    datasetInfo.tags.map((tag, ind) => (
                      <Tag color="cyan" key={ind}>
                        {tag}
                      </Tag>
                    ))}
                </>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Project Administrators" span={1}>
              <Paragraph
                style={{
                  color: 'rgba(0,0,0,0.8)',
                }}
                ellipsis={{
                  rows: 2,
                  expandable: true,
                }}
              >
                {userListOnDataset &&
                  userListOnDataset.map((i, index) => {
                    const len = userListOnDataset.length;
                    let separator = index + 1 === len ? '' : ',';
                    return (
                      <a
                        href={
                          'mailto:' +
                          i.email +
                          `?subject=[VRE Platform: ${datasetInfo.name}]`
                        }
                        //ref="noopener noreferrer"
                        // eslint-disable-next-line
                        target="_blank"
                        style={{ paddingRight: '5px' }}
                        key={index}
                      >
                        {i.firstName + ' ' + i.lastName + separator}
                      </a>
                    );
                  })}
              </Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={3}>
              {editView ? (
                <div>
                  <TextArea
                    defaultValue={datasetInfo.description}
                    onChange={(e) =>
                      updateDatasetInfo('description', e.target.value)
                    }
                    showCount
                    maxLength={250}
                  />
                  <span style={{ float: 'right' }}>{`${
                    datasetUpdate.description
                      ? datasetUpdate.description.length
                      : 0
                  }/250`}</span>
                </div>
              ) : (
                <>{datasetInfo.description}</>
              )}
            </Descriptions.Item>
          </Descriptions>
        </>
      );
    }
  };
  return <>{printDetails()}</>;
}

export default connect(
  (state) => ({
    containersPermission: state.containersPermission,
    datasetList: state.datasetList,
  }),
  { UpdateDatasetCreator },
)(withRouter(Description));
