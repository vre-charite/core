import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Table, DatePicker } from 'antd';
import { CalTimeDiff } from '../../../Utility/timeCovert';
import 'antd/dist/antd.css';
import moment from 'moment';
import { DatasetCard as Card } from '../Components/DatasetCard/DatasetCard';
import DatasetActivityViewSelector from './DatasetActicityViewSelector';
import { getDatasetActivityLogsAPI } from '../../../APIs/index';
import logsInfo from './DatasetActivityLogsDisplay';
import styles from './DatasetActivity.module.scss';

const { RangePicker } = DatePicker;
const format = 'YYYY-MM-DD HH:mm:ss';

const DatasetActivity = (props) => {
  const [viewValue, setViewValue] = useState('All');
  const [lastUpdateTime, setLastUpdateTime] = useState('');
  const [customTimeRange, setCustomTimeRange] = useState([]);
  const [cusTimeRangeChangeTimes, setCusTimeRangeChangeTimes] = useState(0);
  const [activityLogs, setActivityLogs] = useState([]);
  const [publishRecord, setPublishRecord] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItem, setTotalItem] = useState(0);
  const [datePickerDisabled, setDatePickerDisabled] = useState(true);
  const datasetInfo = useSelector((state) => state.datasetInfo.basicInfo);
  const datasetGeid = datasetInfo.geid;

  const columns = [
    {
      title: 'Date',
      key: 'date',
      with: '20%',
      render: (item, row, index) => {
        if (publishRecord.includes(index)) {
          return (
            <p style={{ fontWeight: 'bold', color: '#003262', margin: '0px'}}>
              {moment.unix(item.source.createTimestamp).format(format)}
            </p>
          );
        } else {
          return moment.unix(item.source.createTimestamp).format(format);
        }
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: '70%',
      render: (item, row, index) => {
        const { action, detail, resource } = item.source;
        return logsInfo(action, detail, resource);
      },
    },
    {
      title: 'By',
      key: 'by',
      width: '10%',
      render: (item, row, index) => {
        if (publishRecord.includes(index)) {
          return (
            <p style={{ fontWeight: 'bold', color: '#003262', margin: '0px' }}>
              {item.source.operator}
            </p>
          );
        } else {
          return <p style={{ margin: '0px' }}>{item.source.operator}</p>;
        }
      },
    },
  ];

  const getDatasetActivityLogs = async () => {
    let queryParams;
    let toTime = moment().endOf('day').unix();
    let fromTime;
    const params = {
      page_size: pageSize,
      page: currentPage - 1,
      order_by: 'create_timestamp',
      order_type: 'desc',
    };

    //Calculate timestamp
    const timeDiffCal = (timeType) => {
      if (timeType === '1 D') {
        fromTime = moment().startOf('day').unix();
      } else if (timeType === '1 W') {
        fromTime = moment().subtract(7, 'days').unix();
      } else if (timeType === '1 M') {
        fromTime = moment().subtract(1, 'months').unix();
      } else if (timeType === '6 M') {
        fromTime = moment().subtract(6, 'months').unix();
      }

      params.query = {
        create_timestamp: { value: [fromTime, toTime], condition: 'between' },
      };
      queryParams = { ...params };
    };

    if (viewValue === 'Custom') {
      if (customTimeRange?.length && customTimeRange[0] && customTimeRange[1]) {
        params.query = {
          create_timestamp: {
            value: [
              customTimeRange[0].startOf('day').unix(),
              customTimeRange[1].endOf('day').unix(),
            ],
            condition: 'between',
          },
        };
        queryParams = { ...params };
      } else {
        queryParams = { ...params };
      }
    } else {
      if (viewValue === 'All') {
        queryParams = { ...params };
      } else if (viewValue === '1 D') {
        timeDiffCal('1 D');
      } else if (viewValue === '1 W') {
        timeDiffCal('1 W');
      } else if (viewValue === '1 M') {
        timeDiffCal('1 M');
      } else if (viewValue === '6 M') {
        timeDiffCal('6 M');
      }
    }

    const res = await getDatasetActivityLogsAPI(datasetGeid, queryParams);
    let newArr = [];
    res.data.result.forEach((el, index) => {
      if (el.source.action === 'PUBLISH') {
        newArr.push(index);
      }
    });
    setPublishRecord(newArr);
    setActivityLogs(res.data.result);
    setTotalItem(res.data.total);
    if (viewValue === 'All') {
      if (res.data.result.length) {
        setLastUpdateTime(res.data.result[0].source.createTimestamp);
      } else {
        setLastUpdateTime(0);
      }
    }
  };

  useEffect(() => {
    if (datasetGeid) {
      getDatasetActivityLogs();
    }
  }, [datasetGeid, currentPage, pageSize, viewValue, cusTimeRangeChangeTimes]);

  const handleViewSelect = (e) => {
    setViewValue(e.currentTarget.textContent);
    if (e.currentTarget.textContent === 'Custom') {
      setDatePickerDisabled(false);
    } else {
      setDatePickerDisabled(true);
    }
  };

  const handleRangePickerSelect = (date, dateString) => {
    setCustomTimeRange(date);
    setCusTimeRangeChangeTimes(cusTimeRangeChangeTimes + 1);
  };

  const disabledDate = (current) => {
    return current && current >= moment().endOf('day');
  };

  const cardTitle = (
    <div style={{ display: 'flex', alignItems: 'baseline' }}>
      <div className={styles.all_activity}>
        <p>All Activity</p>
      </div>
      {
        <DatasetActivityViewSelector
          viewValue={viewValue}
          changeViewValue={handleViewSelect}
        />
      }
      <div className={styles.custom_time}>
        <RangePicker
          className={styles.range_picker}
          disabled={datePickerDisabled}
          disabledDate={disabledDate}
          onChange={handleRangePickerSelect}
        />
      </div>
      <div className={styles.last_update}>
        <p style={{ fontStyle: 'Italic' }}>
          Last update: {CalTimeDiff(lastUpdateTime)}
        </p>
      </div>
    </div>
  );

  const onTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <div style={{ margin: '15px 24px 0px 15px' }}>
      <Card title={cardTitle}>
        <Table
          className={styles.dataset_activity_table}
          columns={columns}
          dataSource={activityLogs}
          onChange={onTableChange}
          pagination={{
            current: currentPage,
            pageSize,
            total: totalItem,
            pageSizeOptions: [10, 20, 50],
            showSizeChanger: true,
          }}
          size="middle"
          style={{tableLayout: 'fixed'}}
        />
      </Card>
    </div>
  );
};

export default DatasetActivity;
