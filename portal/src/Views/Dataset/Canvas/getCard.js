import React from 'react';

import { Row, Table, List, Avatar } from 'antd';
import {
  MailOutlined,
  FacebookOutlined,
  TwitterOutlined,
  YoutubeOutlined,
  SlackOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import FileExplorer from './Charts/FileExplorer/FileExplorer';
import Description from './Charts/Description/Description';
import Info from './Cards/Info';
import FileStats from './Cards/FileStats';
import UserStats from './Cards/UserStats';
import UploaderStats from './Cards/UploaderStats';
import UploaderHistory from './Cards/UploaderHistory';

var _ = require('lodash');

const getcard = (card, data, actions, state) => {
  let res;
  switch (card.type) {
    case 'text':
      res = <Description content={card.content} />;
      break;
    case 'info':
      res = <Info />;
      break;
    case 'fileStats':
      res = <FileStats />;
      break;
    case 'userStats':
      res = <UserStats />;
      break;
    case 'uploaderStats':
      res = <UploaderStats />;
      break;
    case 'uploaderHistory':
      res = <UploaderHistory />;
      break;
    case 'more':
      res = (
        <div style={{ padding: '10px', minHeight: '237px' }}>
          <h3>LINK</h3>
          <ul>
            <li>
              <a href="https://www.ontario.ca/page/2019-novel-coronavirus/">
                The 2019 Novel Coronavirus (COVID-19)
              </a>
            </li>
            <li>
              <a href="https://www.canada.ca/en/public-health/services/diseases/2019-novel-coronavirus-infection.html?topic=tilelink/">
                Coronavirus disease (COVID-19): Outbreak update
              </a>
            </li>
          </ul>
          <h3>CONTACT US</h3>

          <div
            style={{
              fontSize: '25px',
              display: 'flex',
              justifyContent: 'space-evenly',
              paddingTop: '20px',
            }}
          >
            <MailOutlined />
            <FacebookOutlined />
            <TwitterOutlined />
            <YoutubeOutlined />
            <SlackOutlined />
          </div>
        </div>
      );
      break;
    case 'files': {
      const columns = [
        {
          title: 'File',
          dataIndex: 'file',
          key: 'file',
        },
        {
          title: 'uploader',
          dataIndex: 'uploader',
          key: 'uploader',
        },
        { title: 'Upload Time', dataIndex: 'timeCreated', key: 'timeCreated' },
      ];

      const dataSource = [
        { file: 'x-ray scan', uploader: 'Billy', timeCreated: '2020-06-19' },
      ];
      res = (size, exportState, onExportClick) => {
        return <FileExplorer />;
      };
      break;
    }
    case 'datasets': {
      const list = [
        {
          name: 'dataset1',
          description: 'this is dataset1',
        },
        {
          name: 'dataset2',
          description: 'this is dataset2',
        },
      ];
      res = (size, exportState, onExportClick) => (
        <List
          className="demo-loadmore-list"
          itemLayout="horizontal"
          dataSource={state.children}
          renderItem={(item) => (
            <List.Item
              actions={[
                <a key="list-loadmore-edit">
                  <Link to={`/dataset/${parseInt(item.id)}/canvas`}>Enter</Link>{' '}
                </a>,
                <a key="list-loadmore-more">More</a>,
              ]}
            >
              <List.Item.Meta
                title={<a href="https://ant.design">{item.dataset_name}</a>}
                description={'the description of ' + item.dataset_name}
              />
              {/*  <div>content</div> */}
            </List.Item>
          )}
        />
      );
      break;
    }
    default:
      break;
  }
  return res;
};

export default getcard;
