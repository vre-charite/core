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
} from 'antd';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import {
  updateDatasetInfoAPI,
  getAdminsOnDatasetAPI,
  listAllContainersPermission,
} from '../../../../APIs';
import { UpdateDatasetCreator } from '../../../../Redux/actions';
import {
  useCurrentProject,
  objectKeysToSnakeCase,
  timeConvert,
  trimString,
  reduxActionWrapper,
} from '../../../../Utility';
import { objectKeysToCamelCase } from '../../../../Utility';
import { useTranslation } from 'react-i18next';
import {
  setContainersPermissionCreator,
  setUserRoleCreator,
} from '../../../../Redux/actions';
import { useSelector } from 'react-redux';
const { TextArea } = Input;
const { Paragraph, Title } = Typography;

function Description(props) {
  const [editView, setEditView] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [datasetUpdate, setDatasetUpdate] = useState(null);
  const [userListOnDataset, setUserListOnDataset] = useState(null);
  const [tagErrorMsg, setTagErrorMsg] = useState(null);
  const [nameErrorMsg, setNameErrorMsg] = useState(null);
  const { t, i18n } = useTranslation(['formErrorMessages']);
  const [isSaving, setIsSaving] = useState(false);
  const {
    containersPermission,
    match: {
      params: { datasetId },
    },
    datasetList,
  } = props;

  const [
    setContainersPermissionDispatcher,
    setUserRoleDispatcher,
  ] = reduxActionWrapper([setContainersPermissionCreator, setUserRoleCreator]);

  const { username } = useSelector((state) => state);

  useEffect(() => {
    if (datasetList.length > 0) {
      const currentDataset = _.find(
        datasetList[0].datasetList,
        (d) => d.id === parseInt(datasetId),
      );

      setDatasetInfo(currentDataset);
      setDatasetUpdate(currentDataset);
    }
  }, [containersPermission, datasetList, datasetId]);

  const [currentContainer] = useCurrentProject();

  useEffect(() => {
    currentContainer &&
      getAdminsOnDatasetAPI(datasetId).then((res) => {
        console.log(
          'Description -> res',
          objectKeysToCamelCase(res.data.result),
        );
        setUserListOnDataset(objectKeysToCamelCase(res.data.result));
      });
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

    if (datasetUpdate['name'] && datasetUpdate['name'].length > 250) {
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
      if (!['timeCreated', 'timeLastmodified'].includes(key)) {
        data2Update[key] = datasetUpdate[key];
      }
    }

    // call API to update project info
    updateDatasetInfoAPI(datasetId, objectKeysToSnakeCase(data2Update))
      .then((res) => {
        let newDataInfo = res.data.result[0];
        let index = datasetList[0].datasetList.findIndex(
          (d) => d.id === parseInt(datasetId),
        );
        let newDatasetList = [
          ...datasetList,
          (datasetList[0].datasetList[index] = newDataInfo),
        ];
        console.log(newDatasetList);
        props.UpdateDatasetCreator(
          newDatasetList[0].datasetList,
          'All Projects',
        );
        updateContainerPremission();
        setDatasetInfo(newDataInfo);
        setDatasetUpdate(newDataInfo);
        setEditView(false);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const updateContainerPremission = async () => {
    const {
      data: { result: containersPermission },
    } = await listAllContainersPermission(username);
    setContainersPermissionDispatcher(containersPermission.permission);
    setUserRoleDispatcher(containersPermission.role);
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
      let isNameInvalid = value.length > 250;
      if (isNameInvalid) {
        message.error(t('formErrorMessages:project.card.update.name.valid'));
        setNameErrorMsg(t('formErrorMessages:project.card.update.name.valid'));
      } else {
        setNameErrorMsg(null);
      }
    }

    setDatasetUpdate({ ...datasetUpdate, [field]: value });
    // setDatasetInfo({ ...datasetInfo, [field]: value })
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
          <>
            {!currentContainer ||
            currentContainer['permission'] !== 'admin' ? null : editView ? (
              <div style={{ marginTop: '12px', float: 'right' }}>
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
              </div>
            ) : (
              <Button
                style={{ marginTop: '14px', float: 'right' }}
                onClick={(e) => setEditView(true)}
              >
                Edit
              </Button>
            )}
            <small>
              Created on {timeConvert(datasetInfo.timeCreated, 'date')} |
              Project code: {datasetInfo.code}
            </small>
            {/*             <Title
              level={4}
              ellipsis={{
                rows: 1,
              }}
              style={{ paddingRight: '10px' }}
            >
              {datasetInfo.name}
            </Title> */}
          </>

          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Project Name">
              {editView ? (
                <Input
                  defaultValue={datasetInfo.name}
                  onChange={(e) => updateDatasetInfo('name', e.target.value)}
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
                    datasetInfo.tags.map((tag) => (
                      <Tag color="cyan">{tag}</Tag>
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
                        target="_blank"
                        // ref="noreferrer noopener"
                        style={{ paddingRight: '5px' }}
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
