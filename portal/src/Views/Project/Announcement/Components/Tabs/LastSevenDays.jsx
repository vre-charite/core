import React, { useState, useEffect } from 'react';
import { Pagination, List, message } from 'antd';
import { getAnnouncementApi } from '../../../../../APIs';
import styles from '../../index.module.scss';
import moment from 'moment';
import {ErrorMessager,namespace} from '../../../../../ErrorMessages'
export default function LastSevenDays({ currentProject, indicator }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const projectCode = currentProject?.code;
  const projectId = currentProject?.id;
  useEffect(() => {
    const today = moment().endOf('day').utc().format('YYYY-MM-DD HH:mm:ss');
    const sevenDays = moment()
      .subtract(7, 'days')
      .startOf('day')
      .utc()
      .format('YYYY-MM-DD HH:mm:ss');
    setLoading(true);
    getAnnouncementApi({
      projectCode,
      page,
      pageSize,
      startDate: sevenDays,
      endDate: today,
    })
      .then((res) => {
        const { result } = res.data;
        setTotal(result?.total);
        setAnnouncements(result?.result);
      })
      .catch((err) => {
        console.log(err);
        const errorMessage = new ErrorMessager(namespace.announcement.getAnnouncementApi);
        errorMessage.triggerMsg();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId, page, pageSize, indicator]);
  const onChange = (currentPage, pageSize) => {
    setPage(String(currentPage - 1));
    setPageSize(String(pageSize));
  };

  return (
    <>
      <List
        loading={loading}
        dataSource={announcements}
        renderItem={(announcement) => (
          <List.Item className={styles.announce_item}>
            <List.Item.Meta
              title={
                <span
                  style={{ whiteSpace: 'pre-line', wordBreak: 'break-all' }}
                >
                  {announcement.content}
                </span>
              }
              description={`${announcement.publisher} - ${moment(
                announcement.date + 'Z',
              ).format('MMMM Do YYYY, h:mm:ss a')}`}
            />
          </List.Item>
        )}
      />
      <Pagination
        className={styles.announce_pagination}
        onChange={onChange}
        showSizeChanger
        onShowSizeChange={onChange}
        pageSize={pageSize}
        current={page + 1}
        total={total}
      />
    </>
  );
}
