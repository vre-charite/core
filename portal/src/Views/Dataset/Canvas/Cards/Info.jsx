import React, { useState, useEffect } from 'react';
import {
  Typography,
  Descriptions,
  Tag,
  Button,
  Input,
  Select,
  Form,
  message,
} from 'antd';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { updateDatasetInfoAPI } from '../../../../APIs';
import { UpdateDatasetCreator } from '../../../../Redux/actions';
import { PresetStatusColorTypes } from 'antd/lib/_util/colors';
const { TextArea } = Input;

function Description(props) {
  const [editView, setEditView] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [datasetUpdate, setDatasetUpdate] = useState(null);

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
  }, [containersPermission, datasetList]);

  const currentContainer =
    containersPermission &&
    containersPermission.find((ele) => {
      return parseInt(ele.container_id) === parseInt(datasetId);
    });

  const saveDatasetInfo = () => {
    // check information (name is required)
    console.log('Description -> datasetUpdate', datasetUpdate);
    if (!datasetUpdate['name']) {
      message.error('Project Name is required.');
      return;
    }

    // call API to update project info
    updateDatasetInfoAPI(datasetId, datasetUpdate).then((res) => {
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
    });
  };

  const updateDatasetInfo = (field, value) => {
    setDatasetUpdate({ ...datasetUpdate, [field]: value });
  };

  function tagRender(props) {
    const { label, value, closable, onClose } = props;

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
    // console.log('printDetails -> datasetInfo', datasetInfo);

    if (datasetInfo) {
      return (
        <>
          <Descriptions layout="vertical" bordered size="small">
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
            <Descriptions.Item label="Project Code">
              <>{datasetInfo.code}</>
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              <>{datasetInfo.time_created.split('T')[0]}</>
            </Descriptions.Item>
            <Descriptions.Item label="Tags" span={3}>
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
            {/* <Descriptions.Item label="Custom Metadata" span={2}>
            {currentDataset &&
              Object.keys(currentDataset).map((key) => {
                return (
                  key.startsWith('_') && (
                    <Tag color="green">{currentDataset[key]}</Tag>
                  )
                );
              })}
          </Descriptions.Item> */}
            {/* <Descriptions.Item label="Principle Investigator">
            {currentDataset.pi}
          </Descriptions.Item> */}
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

          {currentContainer['permission'] !== 'admin' ? null : editView ? (
            <div style={{ marginTop: '20px', float: 'right' }}>
              <Button type="link" onClick={(e) => setEditView(false)}>
                Cancel
              </Button>
              <Button type="primary" onClick={saveDatasetInfo}>
                Save
              </Button>
            </div>
          ) : (
            <Button
              style={{ marginTop: '20px', float: 'right' }}
              onClick={(e) => setEditView(true)}
            >
              Edit
            </Button>
          )}
        </>
      );
    }
  };
  return (
    <>
      {printDetails()}
      {/* <Title level={3}>
        {currentContainer ? (
          <>{currentContainer.container_name} </>
        ) : (
          'Not Available'
        )}
      </Title>
      <p>{content} </p> */}
    </>
  );
}

export default connect(
  (state) => ({
    containersPermission: state.containersPermission,
    datasetList: state.datasetList,
  }),
  { UpdateDatasetCreator },
)(withRouter(Description));
