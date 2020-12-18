import React, { useState, useEffect } from 'react';
import {
  Timeline,
  Tabs,
  DatePicker,
  Row,
  Col,
  Form,
  Select,
  Button,
  Pagination,
  Empty,
  Spin,
  Space,
} from 'antd';
import moment from 'moment';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styles from './index.module.scss';

import { getUsersOnDatasetAPI, projectFileSummary, fileAuditLogsAPI } from '../../../../APIs';
import { objectKeysToCamelCase, timeConvert, pathsMap } from '../../../../Utility';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

const FileStatModal = (props) => {
  const [form] = Form.useForm();
  const today = new Date();
  const { t, i18n } = useTranslation(['tooltips', 'formErrorMessages']);

  const [treeData, setTreeData] = useState([]);
  const [action, setAction] = useState('upload');
  const [dateRange, setDateRange] = useState([
    moment(today, dateFormat),
    moment(today, dateFormat),
  ]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const { datasetId, currentUser, isAdmin } = props;
  const datasetList = useSelector((state) => state.datasetList);
  const containersPermission = useSelector((state) => state.containersPermission);

  const currentDataset = _.find(
    datasetList && datasetList[0].datasetList,
    (d) => d.id === parseInt(datasetId),
  );

  const currentPermission = containersPermission.find(el => el.containerId === parseInt(datasetId));

  useEffect(() => {
    const now = moment();
    if (isAdmin) {
      getUsersOnDatasetAPI(datasetId).then((res) => {
        const result = objectKeysToCamelCase(res.data.result);
        setUsers(result);

        setSelectedUser('all');
        form.setFieldsValue({ user: 'all' });
        form.setFieldsValue({
          date: [moment(today, dateFormat), moment(today, dateFormat)],
        });
        form.setFieldsValue({ action: 'upload' });

        projectFileSummary(datasetId, isAdmin, {
          page: 0,
          size: 10,
          action: 'upload',
          startDate: now.startOf('day').unix(),
          endDate: now.endOf('day').unix(),
        }).then((res) => {
          setTreeData(res.data.result.recentUpload);
          setTotal(res.data.result.uploadCount);
          setLoading(false);
        });
      });
    } else {
      setUsers([{ name: currentUser }]);
      form.setFieldsValue({ user: currentUser });
      form.setFieldsValue({
        date: [moment(today, dateFormat), moment(today, dateFormat)],
      });
      form.setFieldsValue({ action: 'upload' });

      projectFileSummary(datasetId, isAdmin, {
        user: currentUser,
        page: 0,
        size: 10,
        action: 'upload',
        startDate: now.startOf('day').unix(),
        endDate: now.endOf('day').unix(),
      }).then((res) => {
        setTreeData(res.data.result.recentUpload);
        setTotal(res.data.result.uploadCount);
        setLoading(false);
      });
    }
  }, [datasetId]);

  const userOptions = users.map((el) => (
    <Option value={el.name}>{el.name}</Option>
  ));

  if (isAdmin) userOptions.unshift(<Option value="all">All Users</Option>);

  const disabledDate = (current) => {
    return current && current >= moment().endOf('day');
  };

  const onFinish = (values) => {
    setIsSearching(true);
    const params = {};
    setLoading(true);

    const date = values.date;

    params['startDate'] = moment(date[0]).startOf('day').unix();
    params['endDate'] = moment(date[1]).endOf('day').unix();

    setDateRange([
      moment(date[0]).format('YYYY-MM-DD'),
      moment(date[1]).format('YYYY-MM-DD'),
    ]);

    if (values.user !== 'all') params.user = values.user;

    params['action'] = values.action;
    params['size'] = 10

    setTreeData([]);
    setAction(values.action);
    setSelectedUser(values.user);

    if (values.action === 'copy') {
      const params4Copy = {
        'page_size': 10,
        'page': 0,
        'operation_type': 'data_transfer',
        'project_code': currentDataset && currentDataset.code,
        'start_date': moment(date[0]).startOf('day').unix(),
        'end_date': moment(date[1]).endOf('day').unix(),
        'container_id': datasetId
      };
      if (values.user !== 'all') params4Copy['operator'] = values.user;
      fileAuditLogsAPI(params4Copy)
        .then((res) => {
          if (res.status === 200) {
            const { result, total } = res.data;

            setTreeData(result);
            setTotal(total);
            setPage(1);
            setLoading(false);
          }
        }).finally(()=>{
          setIsSearching(false);
        });
    } else {
      projectFileSummary(datasetId, isAdmin, params).then((res) => {
        if (values.action === 'upload') {
          setTreeData(res.data.result.recentUpload);
          setTotal(res.data.result.uploadCount);
        } else {
          setTreeData(res.data.result.recentDownload);
          setTotal(res.data.result.downloadCount);
        }
        setPage(1);
        setLoading(false);
      }).finally(()=>{
        setIsSearching(false);
      });
    }
  };

  const onReset = () => {
    form.resetFields();
    setTreeData([]);
  };

  const onChangePage = (page, pageSize) => {
    const params = {};
    setPage(page);
    setLoading(true);

    params.action = action;
    if (selectedUser !== 'all') params.user = selectedUser;

    params.startDate = moment(dateRange[0]).startOf('day').unix();
    params.endDate = moment(dateRange[1]).endOf('day').unix();

    params.page = page - 1;
    params.size = 10;

    if (action === 'copy') {
      const params4Copy = {
        'page_size': 10,
        'page': page - 1,
        'operation_type': 'data_transfer',
        'project_code': currentDataset && currentDataset.code,
        'start_date': params.startDate,
        'end_date': params.endDate,
        'container_id': datasetId
      };
      if (selectedUser !== 'all') params4Copy['operator'] = selectedUser;
      fileAuditLogsAPI(params4Copy)
        .then((res) => {
          if (res.status === 200) {
            const { result, total } = res.data;

            setTreeData(result);
            setTotal(total);
            setLoading(false);
          }
        }).finally(()=>{
          setIsSearching(false);
        });

    } else {
      projectFileSummary(datasetId, isAdmin, params).then((res) => {
        if (action === 'upload') {
          setTreeData(res.data.result.recentUpload);
          setTotal(res.data.result.uploadCount);
        } else {
          setTreeData(res.data.result.recentDownload);
          setTotal(res.data.result.downloadCount);
        }
        setLoading(false);
      });
    }
  };

  let resultContent = (
    <Empty description="No Results" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  );

  const filterData = treeData;

  if (filterData && filterData.length > 0) {
    resultContent = (
      <div>
        <Timeline style={{ marginTop: 40 }}>
          {filterData &&
            filterData.map((i) => {
              let { owner, createTime, fileName, downloader, operator, originPath, path } = i['attributes'];
              let localTime = null;
              if (typeof createTime === 'number') {
                localTime = moment(createTime*1000).format('YYYY-MM-DD HH:mm:ss');
              } else {
                localTime = timeConvert(createTime, 'datetime');
              }

              if (action === 'copy') {
                const originPathArray = originPath && originPath.split('/');
                const pathArray = path && path.split('/');

                const originPathName = originPathArray && pathsMap(originPathArray);
                const pathName = pathArray && pathsMap(pathArray);

                if (originPathName && pathName) {
                  return (
                    <Timeline.Item color="green">
                      <span>
                      {operator} copied {fileName} from {originPathName} to {pathName} at{' '}
                      {localTime}
                      </span>
                    </Timeline.Item>
                  );
                }

                return (
                  <Timeline.Item color="green">
                    {operator} copied {fileName} at{' '}
                    {localTime}
                  </Timeline.Item>
                );
              } 

              return (
                <Timeline.Item color="green">
                  {owner || downloader} {action}ed {fileName} at{' '}
                  {localTime}
                </Timeline.Item>
              );
            })}
        </Timeline>

        <Pagination
          total={page === 0 && filterData.length < 10 ? filterData.length : total}
          size="small"
          style={{ float: 'right' }}
          onChange={onChangePage}
          showSizeChanger={false}
          current={page}
        />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 15 }}>
      <Tabs type="card">
        <TabPane tab="Search by" key="filters">
          <Form
            form={form}
            name="advanced_search"
            style={{
              padding: 24,
              background: '#fbfbfb',
              border: '1px solid #d9d9d9',
              borderRadius: 2,
            }}
            onFinish={onFinish}
            layout="vertical"
          >
            <div className={styles.filterWrapper}>
              <div className={styles.fieldGroup}>
                <Form.Item
                  name="date"
                  rules={[
                    {
                      required: true,
                      message: t(
                        'formErrorMessages:project.fileStatSearch.date.empty',
                      ),
                    },
                  ]}
                  label="Date"
                  className={styles.formItem}
                >
                  <RangePicker
                    disabledDate={disabledDate}
                    style={{ minWidth: 100 }}
                  />
                </Form.Item>
              </div>
              <div className={styles.fieldGroup}>
                <Form.Item
                  name="user"
                  rules={[
                    {
                      required: true,
                      message: t(
                        'formErrorMessages:project.fileStatSearch.user.empty',
                      ),
                    },
                  ]}
                  label="User"
                  className={styles.formItem}
                >
                  <Select style={{ minWidth: 100 }}>{userOptions}</Select>
                </Form.Item>
              </div>
              <div className={styles.fieldGroup}>
                <Form.Item
                  name="action"
                  rules={[
                    {
                      required: true,
                      message: t(
                        'formErrorMessages:project.fileStatSearch.type.empty',
                      ),
                    },
                  ]}
                  label="Type"
                  className={styles.formItem}
                >
                  <Select style={{ minWidth: 100 }}>
                    <Option value="upload">Upload</Option>
                    <Option value="download">Download</Option>
                    {currentPermission.permission === 'admin' ? (
                      <Option value="copy">Copy</Option>
                    ) : null }
                   
                  </Select>
                </Form.Item>
              </div>
              <div className={styles.fieldGroup}>
                <Space className={styles.buttons}>
                  <Button
                    loading={isSearching}
                    type="primary"
                    htmlType="submit"
                  >
                    Search
                  </Button>
                  <Button onClick={onReset}>Clear</Button>
                </Space>
              </div>
            </div>
          </Form>
        </TabPane>
      </Tabs>

      <Spin spinning={loading}>{resultContent}</Spin>
    </div>
  );
};

export default FileStatModal;
