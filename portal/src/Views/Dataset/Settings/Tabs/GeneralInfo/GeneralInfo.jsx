import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import {
  Form,
  Input,
  Button,
  Switch,
  Tag,
  Select,
  Avatar,
  Upload,
  message,
  Typography,
} from 'antd';
import styles from '../../index.module.scss';
import { withRouter } from 'react-router-dom';
import { useSelector, useDispatch, connect } from 'react-redux';
import { EditOutlined } from '@ant-design/icons';
import {
  updateDatasetInfoAPI,
  getAdminsOnDatasetAPI,
  getProjectInfoAPI,
  updateDatasetIcon,
} from '../../../../../APIs';
import {
  trimString,
  objectKeysToSnakeCase,
  objectKeysToCamelCase,
} from '../../../../../Utility';
import {
  setContainersPermissionCreator,
  UpdateDatasetCreator,
} from '../../../../../Redux/actions';
import ImgCrop from 'antd-img-crop';
import { useTranslation } from 'react-i18next';
const { TextArea } = Input;
const { Paragraph } = Typography;
function GeneralInfo(props) {
  const {
    containersPermission,
    match: {
      params: { datasetId },
    },
  } = props;
  const project = useSelector((state) => state.project);
  const { t } = useTranslation(['formErrorMessages']);
  const [editMode, setEditMode] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState(
    project ? project.profile : null,
  );
  const [datasetUpdate, setDatasetUpdate] = useState(
    project ? project.profile : null,
  );
  const [userListOnDataset, setUserListOnDataset] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    async function loadProject() {
      const res = await getProjectInfoAPI(datasetId);
      if (res.status === 200 && res.data && res.data.code === 200) {
        const currentDataset = res.data.result;
        setDatasetInfo(currentDataset);
        setDatasetUpdate(currentDataset);
      }
      const users = await getAdminsOnDatasetAPI(datasetId);
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
    // call API to update project info
    updateDatasetInfoAPI(datasetId, objectKeysToSnakeCase(data2Update)).then(
      (res) => {
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
        setDatasetInfo(data2Update);
        setTimeout(() => {
          setEditMode(false);
          setIsSaving(false);
        }, 500);
      },
    );
  };

  function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }
  function beforeIconChange(file) {
    getBase64(file, async (imageUrl) => {
      const compressedIcon = await resizeImage(imageUrl);
      await updateDatasetIcon(datasetId, compressedIcon);
      setDatasetInfo({
        ...datasetInfo,
        icon: compressedIcon,
      });
    });
    return false;
  }
  function imageToDataUri(img, width, height) {
    var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL();
  }
  function resizeImage(originalDataUri) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.onload = () => {
        var newDataUri = imageToDataUri(img, 200, 200);
        resolve(newDataUri);
      };
      img.src = originalDataUri;
    });
  }
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
  return datasetInfo ? (
    <div style={{ padding: 20 }}>
      <div
        style={{
          marginLeft: 40,
          marginRight: 40,
          marginTop: 40,
          marginBottom: 40,
        }}
      >
        {datasetInfo.icon ? (
          <Avatar src={datasetInfo.icon} size={100}></Avatar>
        ) : (
          <Avatar
            style={{ backgroundColor: '#13c2c2', verticalAlign: 'middle' }}
            size={100}
          >
            <span
              style={{
                fontSize: 50,
                fontWeight: 'bold',
                textTransform: 'uppercase',
              }}
            >
              {datasetInfo.name ? datasetInfo.name.charAt(0) : ''}
            </span>
          </Avatar>
        )}

        <div
          style={{
            display: 'inline-block',
            marginLeft: 30,
            verticalAlign: 'middle',
          }}
        >
          <h4
            style={{
              color: 'rgba(0,0,0,0.65)',
              margin: '0 0 4px 0',
              fontSize: 16,
              fontWeight: 'bolder',
            }}
          >
            Upload your project icon
          </h4>
          <p
            style={{ color: 'rgba(0,0,0,0.25)', margin: '4px 0', fontSize: 13 }}
          >
            Recommended size is 200 x 200px
          </p>
          <ImgCrop shape="round">
            <Upload showUploadList={false} beforeUpload={beforeIconChange}>
              <div
                style={{
                  border: '1px solid #1890ff',
                  color: '#1890ff',
                  padding: '2px 15px',
                  borderRadius: 2,
                  cursor: 'pointer',
                }}
              >
                Upload icon
              </div>
            </Upload>
          </ImgCrop>
        </div>
      </div>
      <Form
        layout="vertical"
        style={{ width: '70%', maxWidth: 700, marginLeft: 40, marginRight: 40 }}
        className={styles.custom_general_info_form}
      >
        <div style={{ width: '46%', display: 'inline-block' }}>
          <Form.Item label="Project Name">
            {editMode ? (
              <Input
                defaultValue={datasetInfo.name}
                onChange={(e) =>
                  updateDatasetInfo('name', _.trimStart(e.target.value))
                }
              />
            ) : (
              datasetInfo.name
            )}
          </Form.Item>
        </div>
        <div
          style={{
            float: 'right',
            display: 'inline-block',
            marginRight: 10,
            width: 268,
          }}
        >
          <div style={{width:320,paddingRight:10}}>
            <Form.Item label="Visibility">
              <Switch
                disabled={!editMode}
                defaultChecked={datasetInfo.discoverable}
                onChange={(checked, e) =>
                  updateDatasetInfo('discoverable', checked)
                }
                checkedChildren="on"
                unCheckedChildren="off"
              />
              <span
                style={{ marginLeft: 15, whiteSpace: 'nowrap', float: 'right' }}
              >
                {!datasetUpdate?.discoverable && 'Not '}discoverable by all
                platform users
              </span>
            </Form.Item>
          </div>
        </div>
        <Form.Item label="Project Administrator">
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
                    rel="noreferrer noopener"
                    style={{ paddingRight: '5px' }}
                    key={index}
                  >
                    {i.firstName + ' ' + i.lastName + separator}
                  </a>
                );
              })}
          </Paragraph>
        </Form.Item>
        <Form.Item label="Tags">
          {editMode ? (
            <Select
              mode="tags"
              style={{ width: '100%' }}
              tagRender={tagRender}
              defaultValue={datasetInfo.tags ? datasetInfo.tags : []}
              onChange={(value) => updateDatasetInfo('tags', value)}
            ></Select>
          ) : (
            <>
              {datasetInfo &&
                datasetInfo.tags &&
                datasetInfo.tags.map((tag, ind) => (
                  <Tag color="cyan" key={ind}>
                    {tag}
                  </Tag>
                ))}
            </>
          )}
        </Form.Item>
        <Form.Item label="Description">
          {editMode ? (
            <div>
              <TextArea
                autoSize
                defaultValue={datasetInfo.description}
                onChange={(e) =>
                  updateDatasetInfo('description', e.target.value)
                }
                maxLength={250}
              />
              <span style={{ float: 'right' }}>{`${
                datasetUpdate.description ? datasetUpdate.description.length : 0
              }/250`}</span>
            </div>
          ) : (
            <p>{datasetInfo.description}</p>
          )}
        </Form.Item>
        {editMode ? (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ float: 'right' }}>
              <Button
                type="link"
                onClick={(e) => {
                  setEditMode(false);
                }}
              >
                Cancel
              </Button>

              <Button
                type="primary"
                loading={isSaving}
                onClick={saveDatasetInfo}
              >
                Save Change
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ float: 'right', marginRight: -10 }}>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={(e) => {
                  setEditMode(true);
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        )}
      </Form>
    </div>
  ) : null;
}
export default connect(
  (state) => ({
    containersPermission: state.containersPermission,
  }),
  { UpdateDatasetCreator },
)(withRouter(GeneralInfo));
