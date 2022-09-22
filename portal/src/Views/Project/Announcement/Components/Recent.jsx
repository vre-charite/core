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
import { Typography, Card, Spin, message, Empty } from 'antd';
import { getAnnouncementApi } from '../../../../APIs';
import moment from 'moment';
const { Paragraph } = Typography;

export default function Recent({ currentProject, indicator }) {
  const [loading, setLoading] = useState(false);
  const [announcement, setAnnouncement] = useState(null);
  useEffect(() => {
    setLoading(true);
    getAnnouncementApi({ projectCode: currentProject?.code })
      .then((res) => {
        const result = res?.data?.result?.result[0];
        setAnnouncement(result);
      })
      .catch((err) => {
        message.error('Failed to get recent announcement');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentProject.id, indicator]);
  return (
    <Card title="Recent announcement" style={{ width: '100%' }}>
      {loading ? (
        <Spin />
      ) : announcement ? (
        <>
          <Paragraph
            style={{
              whiteSpace: 'pre-line',
              wordBreak:"break-all",
              lineHeight: '16px',
              fontSize: 14,
              marginBottom: 0,
            }}
          >
            {announcement?.content || 'No Data'}
          </Paragraph>
          <span
            style={{ color: 'rgba(0, 0, 0, 0.45)', fontStyle: 'italic' }}
          >{`${announcement?.publisher} - ${
            announcement?.date &&
            moment(announcement.date + 'Z').format('MMMM Do YYYY, h:mm:ss a')
          }`}</span>
        </>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );
}
