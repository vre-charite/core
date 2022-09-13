// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

import React, { useState, useEffect } from 'react';
import { Pagination, List, message } from 'antd';
import { getAnnouncementApi } from '../../../../../APIs';
import styles from '../../index.module.scss';
import moment from 'moment';
import {ErrorMessager,namespace} from '../../../../../ErrorMessages'
export default function Today({ currentProject, indicator }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const projectCode = currentProject?.code;
  const projectId = currentProject?.id;
  useEffect(() => {
    setLoading(true);
    getAnnouncementApi({
      projectCode,
      page,
      pageSize,
      startDate: moment().startOf('day').utc().format('YYYY-MM-DD HH:mm:ss'),
      endDate: moment().endOf('day').utc().format('YYYY-MM-DD HH:mm:ss'),
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
