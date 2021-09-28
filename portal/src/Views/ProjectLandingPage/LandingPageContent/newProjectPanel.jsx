import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Card,
  Form,
  Select,
  Input,
  message,
  Tooltip,
  Avatar,
  Upload,
  Button,
  Switch,
} from 'antd';
import ImgCrop from 'antd-img-crop';
import { createProjectAPI } from '../../../APIs/index';
import {
  UpdateDatasetCreator,
  setContainersPermissionCreator,
} from '../../../Redux/actions';
import { namespace, ErrorMessager } from '../../../ErrorMessages';
import { QuestionCircleOutlined, FileAddOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { trimString } from '../../../Utility';
import styles from './index.module.scss';
import _ from 'lodash';
import { getDatasetByCode } from '../../../APIs';
function NewProjectPanel({
  tags,
  UpdateDatasetCreator,
  setContainersPermissionCreator,
  containersPermission,
  onToggleCreateNewProject,
}) {
  const cancelAxios = { cancelFunction: () => {} };
  const [form] = Form.useForm();
  const onFinish = () => {};
  const [submitting, toggleSubmitting] = useState(false);
  const [description, setDescription] = useState('');
  const [imgURL, setImgURL] = useState('');
  const [discoverable, setDiscoverable] = useState(true);
  const { t } = useTranslation(['tooltips', 'success', 'formErrorMessages']);

  const handleChange = (value) => {
    console.log(value);
  };

  const toggleDiscoverable = () => {
    setDiscoverable(!discoverable);
  };

  const onDescriptionChange = (e) => {
    setDescription(e.target.value);
    form.setFieldsValue({ description: e.target.value });
  };

  function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
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

  function beforeIconChange(file) {
    getBase64(file, async (imageUrl) => {
      const compressedIcon = await resizeImage(imageUrl);
      setImgURL(compressedIcon);
    });
    return false;
  }

  const onSubmit = (values) => {
    toggleSubmitting(true);

    let isTagHasSpace = false;

    isTagHasSpace =
      values.tags && values.tags.some((el) => el.indexOf(' ') >= 0);

    if (isTagHasSpace) {
      message.error(t('formErrorMessages:createProject.tag.space'));
      toggleSubmitting(false);
      return;
    }

    if (values.description) values.description = trimString(values.description);

    createProjectAPI(
      {
        name: _.trimStart(values.name),
        code: values.code,
        tags: values.tags,
        discoverable: discoverable,
        type: 'project',
        icon: imgURL,
        description: values.description,
      },
      cancelAxios,
    )
      .then((res) => {
        UpdateDatasetCreator(res.data.result, 'All Projects');
        toggleSubmitting(false);
        const newContainer = res.data.result.find(
          (item) => item.code === values.code,
        );
        setContainersPermissionCreator([
          {
            ...newContainer,
            permission: 'admin',
          },
          ...containersPermission,
          /* {
            id: newContainer.id,
            name: values.name,
            permission: 'admin',
            code: values.code,
          }, */
        ]);
        message.success(t('success:createProject'));
        onToggleCreateNewProject();
      })
      .catch((err) => {
        toggleSubmitting(false);
        const errorMessage = new ErrorMessager(namespace.landing.createProject);
        if (err.response) {
          errorMessage.triggerMsg(err.response.status, null, {
            projectName: values.name,
          });
        }
      });
  };

  const validator = (rule, value, callback) => {
    if (rule && rule.field === 'tags') {
      const invalidTag = value && value.some((el) => el.length > 32);
      if (invalidTag) callback(t('formErrorMessages:project.tags.valid'));

      if (value && value.includes('copied-to-core'))
        callback('Tag should be different with system reserved tag.');
    }

    callback();
  };

  return (
    <Card className={styles.createNewProjectCard}>
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <div style={{ width: '162px', textAlign: 'right' }}>
          {imgURL ? (
            <Avatar
              src={imgURL}
              style={{
                backgroundColor: '#13c2c2',
                verticalAlign: 'middle',
                marginLeft: '83px',
              }}
              size={50}
            ></Avatar>
          ) : (
            <Avatar
              style={{
                backgroundColor: '#13c2c2',
                verticalAlign: 'middle',
                marginLeft: '83px',
              }}
              size={50}
            >
              ?
            </Avatar>
          )}
        </div>
        <div
          style={{
            width: '240px',
            marginLeft: '15px',
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
        </div>
        <div
          style={{
            width: '240px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ImgCrop shape="round">
            <Upload showUploadList={false} beforeUpload={beforeIconChange}>
              <Button
                type="primary"
                style={{ borderRadius: 6, width: '105px' }}
              >
                Upload icon
              </Button>
            </Upload>
          </ImgCrop>
          <Button
            style={{ border: 'none' }}
            onClick={() => {
              setImgURL('');
            }}
          >
            <p style={{ color: '#1790FA', opacity: '50%' }}>Remove</p>
          </Button>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'flex-end',
          }}
        >
          <div style={{ width: '60px' }}>
            <Switch
              style={{ marginTop: '-16px' }}
              defaultChecked={true}
              onClick={toggleDiscoverable}
            />
          </div>
          <div>
            <p style={{ marginBottom: '0px', marginRight: '151px' }}>
              Visibility
            </p>
            <p style={{ color: '#818181', fontSize: '12px' }}>
              {discoverable
                ? 'Discoverable by all platform users'
                : 'Not discoverable by all platform users'}
            </p>
          </div>
        </div>
      </div>
      <Form
        className={styles.newProjectForm}
        form={form}
        name="create_dataset"
        onFinish={onSubmit}
        style={{ width: '100%' }}
      >
        <div style={{ display: 'flex' }}>
          <p style={{ width: '150px', textAlign: 'right' }}>
            Project Name<span style={{ color: 'red' }}>*</span> &nbsp;
            <Tooltip title={t('create_project.project_name')}>
              <QuestionCircleOutlined style={{ marginLeft: '10px' }} />
            </Tooltip>
          </p>
          <Form.Item
            style={{ flex: 1, marginLeft: '20px' }}
            required
            name="name"
            rules={[
              {
                required: true,
                message: t('formErrorMessages:project.name.empty'),
              },
              {
                validator: (rule, value) => {
                  if (!value) return Promise.reject();

                  const isLengthValid =
                    value &&
                    value.length >= 1 &&
                    value.length <= 100 &&
                    trimString(value) &&
                    trimString(value).length > 0;
                  return isLengthValid
                    ? Promise.resolve()
                    : Promise.reject(t('formErrorMessages:project.name.valid'));
                },
              },
            ]}
          >
            <Input />
          </Form.Item>
        </div>
        <div style={{ display: 'flex' }}>
          <p style={{ width: '150px', textAlign: 'right' }}>
            Project Code<span style={{ color: 'red' }}>*</span>&nbsp;
            <Tooltip title={t('create_project.project_code')}>
              <QuestionCircleOutlined style={{ marginLeft: '10px' }} />
            </Tooltip>
          </p>
          <Form.Item
            name="code"
            style={{ width: '365px', marginLeft: '20px' }}
            required
            rules={[
              {
                required: true,
                message: t('formErrorMessages:project.code.empty'),
              },
              {
                pattern: new RegExp(/^[a-z][a-z0-9]{1,32}$/g), // Format BXT-1234
                message: t('formErrorMessages:project.code.valid'),
              },
              {
                validator: async (rule, value) => {
                  try {
                    await getDatasetByCode(value);
                    return Promise.reject('The project code is taken');
                  } catch (err) {
                    if (err.response.status === 404) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject('Failed to check the project code');
                    }
                  }
                },
              },
            ]}
          >
            <Input />
          </Form.Item>
          <p style={{ width: '100px', textAlign: 'right' }}>
            Tags&nbsp;
            <Tooltip title={t('create_project.tags')}>
              <QuestionCircleOutlined />
            </Tooltip>
          </p>
          <Form.Item
            style={{ flex: 1, marginLeft: '20px' }}
            name="tags"
            rules={[
              {
                pattern: new RegExp(/^\S*$/), // Format BXT-1234
                message: t('formErrorMessages:project.tags.space'),
              },
              {
                validator: validator,
              },
            ]}
          >
            <Select
              getPopupContainer={() =>
                document.getElementById('create_dataset')
              }
              mode="tags"
              style={{ width: '100%', borderRadius: '6px' }}
              placeholder="Add tags"
              onChange={handleChange}
            >
              {tags &&
                tags.map((item) => (
                  <Select.Option key={item}>{item}</Select.Option>
                ))}
            </Select>
          </Form.Item>
        </div>
        <div style={{ display: 'flex' }}>
          <p style={{ width: '150px', textAlign: 'right' }}>
            Description
            <Tooltip title={t('create_project.project_description')}>
              <QuestionCircleOutlined style={{ marginLeft: '10px' }} />
            </Tooltip>
          </p>
          <Form.Item
            style={{ marginBottom: '0px', flex: 1, marginLeft: '20px' }}
            name="description"
            rules={[
              {
                validator: (rule, value) => {
                  const isLengthValid = !value || value.length <= 250;
                  return isLengthValid
                    ? Promise.resolve()
                    : Promise.reject(
                        t('formErrorMessages:project.description.valid'),
                      );
                },
              },
            ]}
          >
            <Input.TextArea
              maxLength={250}
              onChange={onDescriptionChange}
            ></Input.TextArea>
            <span style={{ float: 'right' }}>{`${
              form.getFieldValue('description')
                ? form.getFieldValue('description').length
                : 0
            }/250`}</span>
          </Form.Item>
        </div>
        <div style={{ position: 'absolute', right: '-15px', top: '-41px' }}>
          <Form.Item style={{ marginBottom: '0px' }}>
            <div className={styles.buttonItem}>
              <Button
                style={{ width: '111px', borderRadius: '6px' }}
                loading={submitting}
                type="primary"
                htmlType="submit"
              >
                <FileAddOutlined />
                {` `}Create
              </Button>
              <Button
                disabled={submitting}
                style={{ border: 'none', background: 'white' }}
                onClick={onToggleCreateNewProject}
              >
                <p style={{ color: '#1890FF' }}>Cancel</p>
              </Button>
            </div>
          </Form.Item>
        </div>
      </Form>
    </Card>
  );
}

export default connect(
  (state) => ({
    userList: state.userList,
    tags: state.tags,
    containersPermission: state.containersPermission,
  }),
  { UpdateDatasetCreator, setContainersPermissionCreator },
)(NewProjectPanel);
