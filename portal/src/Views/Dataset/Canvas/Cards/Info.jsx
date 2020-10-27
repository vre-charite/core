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
} from 'antd';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { updateDatasetInfoAPI, getAdminsOnDatasetAPI } from '../../../../APIs';
import { UpdateDatasetCreator } from '../../../../Redux/actions';
import { useCurrentProject, objectKeysToSnakeCase } from '../../../../Utility';
import { objectKeysToCamelCase } from '../../../../Utility';
const { TextArea } = Input;
const { Paragraph, Title } = Typography;

function Description(props) {
  const [editView, setEditView] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [datasetUpdate, setDatasetUpdate] = useState(null);
  const [userListOnDataset, setUserListOnDataset] = useState(null);

  const {
    containersPermission,
    match: {
      params: { datasetId },
    },
    datasetList,
  } = props;

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
    console.log('Description -> datasetUpdate', datasetUpdate);
    if (!datasetUpdate['name']) {
      message.error('Project Name is required.');
      return;
    }

    // call API to update project info
    updateDatasetInfoAPI(datasetId, objectKeysToSnakeCase(datasetUpdate)).then(
      (res) => {
        let newDataInfo = res.data.result[0];
        let index = datasetList[0].datasetList.findIndex(
          (d) => d.id === parseInt(datasetId),
        );
        let newDatasetList = [
          ...datasetList,
          (datasetList[0].datasetList[index] = newDataInfo),
        ];
        console.log('saveDatasetInfo -> newDatasetList', newDatasetList);
        UpdateDatasetCreator(newDatasetList, 'All Projects');
        setDatasetInfo(newDataInfo);
        setEditView(false);
      },
    );
  };

  const updateDatasetInfo = (field, value) => {
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

  const printDetails = () => {
    if (datasetInfo) {
      return (
        <>
          <>
            {!currentContainer ||
            currentContainer['permission'] !== 'admin' ? null : editView ? (
              <div style={{ marginTop: '12px', float: 'right' }}>
                <Button type="link" onClick={(e) => setEditView(false)}>
                  Cancel
                </Button>
                <Button type="primary" onClick={saveDatasetInfo}>
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
              Created at {datasetInfo.timeCreated.split('T')[0]} | Project code:{' '}
              {datasetInfo.code}
            </small>
            <Title
              level={4}
              ellipsis={{
                rows: 1,
              }}
              style={{ paddingRight: '10px' }}
            >
              {datasetInfo.name}
            </Title>
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
                <Select
                  mode="tags"
                  defaultValue={datasetInfo.tags ? datasetInfo.tags : []}
                  style={{ width: '100%' }}
                  onChange={(value) => updateDatasetInfo('tags', value)}
                  tagRender={tagRender}
                >
                  {datasetInfo.tags ? datasetInfo.tags : []}
                </Select>
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
                <TextArea
                  defaultValue={datasetInfo.description}
                  onChange={(e) =>
                    updateDatasetInfo('description', e.target.value)
                  }
                />
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
