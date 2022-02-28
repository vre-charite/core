import React, { useState, useEffect } from 'react';
import {
  Timeline,
  Tabs,
  DatePicker,
  Form,
  Select,
  Button,
  Pagination,
  Empty,
  Spin,
  Space,
  Tooltip,
} from 'antd';
import moment from 'moment';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styles from './index.module.scss';

import { getUsersOnDatasetAPI, getAuditLogsApi } from '../../../../APIs';
import { objectKeysToCamelCase, timeConvert } from '../../../../Utility';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

const FileStatModal = (props) => {
  const [form] = Form.useForm();
  const today = new Date();
  const { t } = useTranslation(['tooltips', 'formErrorMessages']);

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
  const containersPermission = useSelector(
    (state) => state.containersPermission,
  );
  const username = useSelector((state) => state.username);

  const currentDataset = _.find(
    containersPermission,
    (d) => d.id === parseInt(datasetId),
  );

  const currentPermission = containersPermission.find(
    (el) => el.id === parseInt(datasetId),
  );

  useEffect(() => {
    const now = moment();

    if (props.isAdmin) {
      getUsersOnDatasetAPI(currentDataset.globalEntityId).then((res) => {
        const result = objectKeysToCamelCase(res.data.result);
        setUsers(result);

        setSelectedUser('all');
        form.setFieldsValue({ user: 'all' });
        form.setFieldsValue({
          date: [moment(today, dateFormat), moment(today, dateFormat)],
        });
        form.setFieldsValue({ action: 'upload' });

        const paginationParams = {
          page: 0,
          page_size: 10,
        };
        const query = {
          action: 'data_upload',
          start_date: now.startOf('day').unix(),
          end_date: now.endOf('day').unix(),
          resource: 'file',
          project_code: currentDataset && currentDataset.code,
        };
        getAuditLogsApi(
          currentDataset.globalEntityId,
          paginationParams,
          query,
        ).then((res) => {
          setTreeData(res.data.result);
          setTotal(res.data.total);
          setLoading(false);
        });
      });
    } else {
      const users = [];
      users.push({
        name: username,
      });
      setUsers(users);
      setSelectedUser(username);
      form.setFieldsValue({ user: username });
      form.setFieldsValue({
        date: [moment(today, dateFormat), moment(today, dateFormat)],
      });
      form.setFieldsValue({ action: 'upload' });

      const paginationParams = {
        page: 0,
        page_size: 10,
      };
      const query = {
        action: 'data_upload',
        start_date: now.startOf('day').unix(),
        end_date: now.endOf('day').unix(),
        resource: 'file',
        operator: username,
        project_code: currentDataset && currentDataset.code,
      };
      getAuditLogsApi(
        currentDataset.globalEntityId,
        paginationParams,
        query,
      ).then((res) => {
        setTreeData(res.data.result);
        setTotal(res.data.total);
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
    params['size'] = 10;

    setTreeData([]);
    setAction(values.action);
    setSelectedUser(values.user);

    let operation = 'data_transfer';
    if (values.action === 'delete') operation = 'data_delete';
    if (values.action === 'download') operation = 'data_download';
    if (values.action === 'upload') operation = 'data_upload';
    if (values.action === 'all') operation = 'all';

    const paginationParams = {
      page: 0,
      page_size: 10,
    };
    const query = {
      action: operation,
      start_date: moment(date[0]).startOf('day').unix(),
      end_date: moment(date[1]).endOf('day').unix(),
      resource: 'file',
      project_code: currentDataset && currentDataset.code,
    };
    if (values.user !== 'all') query['operator'] = values.user;
    getAuditLogsApi(currentDataset.globalEntityId, paginationParams, query)
      .then((res) => {
        setTreeData(res.data.result);
        setTotal(res.data.total);
        setPage(1);
        setLoading(false);
      })
      .finally(() => setIsSearching(false));
  };

  const onReset = () => {
    form.resetFields();
    setTreeData([]);
  };

  const onChangePage = (page, pageSize) => {
    setPage(page);
    setLoading(true);

    let operation = 'data_transfer';
    if (action === 'delete') operation = 'data_delete';
    if (action === 'download') operation = 'data_download';
    if (action === 'upload') operation = 'data_upload';
    if (action === 'all') operation = 'all';

    const paginationParams = {
      page: page - 1,
      page_size: 10,
    };
    const query = {
      action: operation,
      start_date: moment(dateRange[0]).startOf('day').unix(),
      end_date: moment(dateRange[1]).endOf('day').unix(),
      resource: 'file',
      project_code: currentDataset && currentDataset.code,
    };
    if (selectedUser !== 'all') query['operator'] = selectedUser;
    getAuditLogsApi(
      currentDataset.globalEntityId,
      paginationParams,
      query,
    ).then((res) => {
      setTreeData(res.data.result);
      setTotal(res.data.total);
      setLoading(false);
    });
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
              let {
                action,
                createdTime,
                displayName,
                operator,
                target,
                outcome,
              } = i['source'];
              let localTime = moment(createdTime * 1000).format(
                'YYYY-MM-DD HH:mm:ss',
              );

              let operate = 'copied';
              if (action === 'data_delete') operate = 'deleted';
              if (action === 'data_download') operate = 'downloaded';
              if (action === 'data_upload') operate = 'uploaded';

              if (['copied'].includes(operate)) {
                const originPathArray = target && target.split('/');
                const pathArray = outcome && outcome.split('/');

                const originPathName =
                  originPathArray &&
                  originPathArray.slice(0, originPathArray.length - 1);
                const pathName =
                  pathArray && pathArray.slice(0, pathArray.length - 1);

                return (
                  <Timeline.Item color="green">
                    <span>
                      {operator} {operate} {displayName} from{' '}
                      {originPathName.join('/')} to {pathName.join('/')} at{' '}
                      {localTime}
                    </span>
                  </Timeline.Item>
                );
              } else if (operate === 'deleted') {
                const originPathArray = target && target.split('/');
                const originPathName =
                  originPathArray &&
                  originPathArray.slice(0, originPathArray.length - 1);

                return (
                  <Timeline.Item color="green">
                    <span>
                      {operator} {operate} {displayName} from{' '}
                      {originPathName.join('/')} at {localTime}
                    </span>
                  </Timeline.Item>
                );
              } else if (operate === 'uploaded') {
                return (
                  <Timeline.Item color="green">
                    {operator} {operate} {target} at {localTime}
                  </Timeline.Item>
                );
              }

              return (
                <Timeline.Item color="green">
                  {operator} {operate} {displayName} at {localTime}
                </Timeline.Item>
              );
            })}
        </Timeline>

        <Pagination
          total={
            page === 0 && filterData.length < 10 ? filterData.length : total
          }
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
                    ) : null}
                    <Option value="delete">Delete</Option>
                    <Option value="all">All</Option>
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
