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

import React from 'react';

import { Table, Typography } from 'antd';

import userRoles from '../../../../Utility/project-roles.json';

const { Paragraph } = Typography;

function UserProjectsTable(props) {
  const { dataSource, platformRole } = props;
  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => (a.name > b.name ? 1 : -1),
      width: '65%',
      searchKey: 'name',
      render: (text, record) => {
        return (
          <>
            <Paragraph
              ellipsis={{
                rows: 2,
                expandable: true,
              }}
              style={{ wordBreak: 'break-word', marginBottom: 0 }}
            >
              {text}
              <br />
            </Paragraph>
            <span style={{ color: 'rgba(0,0,0,.3)', fontSize: 11 }}>
              Project code: {record.code}
            </span>
          </>
        );
      },
    },
    {
      title: 'Role',
      dataIndex: 'permission',
      key: 'permission',
      sorter: (a, b) => a.permission.localeCompare(b.permission),
      width: '35%',
      searchKey: 'permission',
      render: (text) => {
        if (text === 'admin') {
          if (platformRole === 'admin') {
            text = 'Platform Administrator';
          } else {
            text = 'Project Administrator';
          }
        } else {
          text = userRoles && userRoles[text] && userRoles[text]['label'];
        }

        return text;
      },
    },
    // {
    //   title: 'Join Date',
    //   dataIndex: 'joinDate',
    //   key: 'joinDate',
    //   sorter: true,
    //   width: '34%',
    //   searchKey: 'name',
    // },
  ];

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      scroll={{ x: true }}
      rowKey={(record) => record.id}
      pagination={{ simple: true }}
    />
  );
}

export default UserProjectsTable;
