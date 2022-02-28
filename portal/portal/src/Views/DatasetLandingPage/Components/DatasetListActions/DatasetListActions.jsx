import React, { useState } from 'react';
import { Menu, Dropdown, Button } from 'antd';
import {
  SortAscendingOutlined,
  DownOutlined,
  SearchOutlined,
  UpOutlined,
  PlusOutlined,
} from '@ant-design/icons';

export default function DatasetListActions(props) {
  const { ACTIONS, action, setAction } = props;

  const sortPanel = (
    <Menu onClick={() => {}}>
      <Menu.Item key="1" value="time-desc">
        Last created
      </Menu.Item>
      <Menu.Item id="uploadercontent_first_created" key="2" value="time-asc">
        First created
      </Menu.Item>
      <Menu.Item key="3" value="name-asc">
        Project name A to Z
      </Menu.Item>
      <Menu.Item key="4" value="name-desc">
        Project name Z to A
      </Menu.Item>
      <Menu.Item key="5" value="code-asc">
        Project code A to Z
      </Menu.Item>
      <Menu.Item key="6" value="code-desc">
        Project code Z to A
      </Menu.Item>
    </Menu>
  );

  if (action === ACTIONS.create) return null;

  return (
    <div>
      {/*       <span style={{ marginRight: '10px' }}>Sort by</span>
      <Dropdown overlay={sortPanel} placement="bottomRight">
        <Button style={{ borderRadius: '6px' }}>
          <SortAscendingOutlined />
          Sort
          <DownOutlined />
        </Button>
      </Dropdown>
      <Button onClick={() => {}}>
        <SearchOutlined />
        {action === ACTIONS.search ? <UpOutlined /> : <DownOutlined />}
      </Button> */}
      <Button
        type="link"
        onClick={() => {
          setAction(ACTIONS.create);
        }}
        icon={<PlusOutlined />}
      >
        Create New
      </Button>
    </div>
  );
}
