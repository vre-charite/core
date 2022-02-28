import React from 'react';
import _ from 'lodash';
import {
  Form,
  Input,
  Switch,
  Tag,
  Select,
  Avatar,
  Upload,
  Typography,
  Button,
} from 'antd';
import styles from '../../index.module.scss';
import { withRouter } from 'react-router-dom';
import { updateDatasetIcon } from '../../../../../APIs';
import { withCurrentProject } from '../../../../../Utility';
import ImgCrop from 'antd-img-crop';
import { PLATFORM } from '../../../../../config';
const { TextArea } = Input;
const { Paragraph } = Typography;
function GeneralInfo(props) {
  const {
    currentProject,
    editMode,
    userListOnDataset,
    updateDatasetInfo,
    datasetUpdate,
    datasetInfo,
    setDatasetInfo,
  } = props;
  function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }
  function beforeIconChange(file) {
    getBase64(file, async (imageUrl) => {
      const compressedIcon = await resizeImage(imageUrl);

      await updateDatasetIcon(currentProject.globalEntityId, compressedIcon);
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
      <Tag closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
        {label}
      </Tag>
    );
  }
  return datasetInfo ? (
    <div style={{ padding: 20 }}>
      <div
        id="setting-left"
        style={{ float: 'left', width: '349px', marginLeft: 6 }}
      >
        <div
          style={{
            display: 'inline-block',
          }}
        >
          {datasetInfo.icon ? (
            <Avatar src={datasetInfo.icon} size={65}></Avatar>
          ) : (
            <Avatar
              style={{ backgroundColor: '#13c2c2', verticalAlign: 'middle' }}
              size={65}
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
        </div>

        <div
          style={{
            display: 'inline-block',
            marginLeft: 26,
            verticalAlign: 'middle',
          }}
        >
          <h4 className={styles.iconTitle}>Upload your project icon</h4>
          <p className={styles.iconP}>Recommended size is 200 x 200px</p>
          <ImgCrop shape="round">
            <Upload showUploadList={false} beforeUpload={beforeIconChange}>
              <Button className={styles.button} type="primary">
                Upload Icon
              </Button>
            </Upload>
          </ImgCrop>
        </div>
        <div style={{ width: 320, paddingRight: 10, marginTop: 38 }}>
          <div style={{ display: 'inline-block' }}>
            {editMode ? (
              <Switch
                style={{ marginTop: 8 }}
                checked={datasetUpdate.discoverable}
                onChange={(checked, e) =>
                  updateDatasetInfo('discoverable', checked)
                }
                checkedChildren="on"
                unCheckedChildren="off"
              />
            ) : (
              <Switch
                style={{ marginTop: 8 }}
                disabled={true}
                checked={datasetInfo.discoverable}
                checkedChildren="on"
                unCheckedChildren="off"
              />
            )}
          </div>

          <div style={{ display: 'inline-block', marginLeft: 17 }}>
            <div className={styles.iconTitle}>Visibility</div>
            <div
              className={styles.iconP}
              style={{
                whiteSpace: 'nowrap',
                float: 'right',
              }}
            >
              {!datasetUpdate?.discoverable && 'Not '}discoverable by all
              platform users
            </div>
          </div>
        </div>
      </div>
      <div id="setting-right" style={{ marginLeft: '349px' }}>
        <Form
          layout="vertical"
          style={{
            maxWidth: 700,
            marginLeft: 40,
            marginRight: 40,
          }}
          className={styles.custom_general_info_form}
        >
          <div style={{ display: 'inline-block' }}>
            <Form.Item label="Project Name">
              {editMode ? (
                <Input
                  style={{ width: 500 }}
                  defaultValue={datasetInfo.name}
                  onChange={(e) =>
                    updateDatasetInfo('name', _.trimStart(e.target.value))
                  }
                />
              ) : (
                <p style={{ wordBreak: 'break-all', width: '100%' }}>
                  {datasetInfo.name}
                </p>
              )}
            </Form.Item>
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
                        `?subject=[${PLATFORM} Platform: ${datasetInfo.name}]`
                      }
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{
                        paddingRight: '5px',
                        color: '#595959',
                        wordBreak: 'break-all',
                      }}
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
                //defaultValue={datasetInfo.tags ? datasetInfo.tags : []}
                onChange={(value) => updateDatasetInfo('tags', value)}
                value={datasetUpdate.tags ? datasetUpdate.tags : []}
              ></Select>
            ) : (
              <>
                {datasetInfo &&
                  datasetInfo.tags &&
                  datasetInfo.tags.map((tag, ind) => (
                    <Tag key={ind}>{tag}</Tag>
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
                  style={{ minHeight: 100 }}
                  maxLength={250}
                />
                <span style={{ float: 'right' }}>{`${
                  datasetUpdate.description
                    ? datasetUpdate.description.length
                    : 0
                }/250`}</span>
              </div>
            ) : (
              <p style={{ wordBreak: 'break-all' }}>
                {datasetInfo.description}
              </p>
            )}
          </Form.Item>
        </Form>
      </div>
    </div>
  ) : null;
}
export default withRouter(withCurrentProject(GeneralInfo));
