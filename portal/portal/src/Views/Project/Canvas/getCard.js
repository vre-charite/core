import React from 'react';
import { List } from 'antd';
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
import FileStats from './Cards/FileStats';
import UserStats from './Cards/UserStats';
import FileStatModal from '../Canvas/Modals/FileStatModal';
import Superset from './Cards/Superset';

const getcard = (card, data, actions, state, handleExpand) => {
  let res;
  switch (card.type) {
    case 'text':
      res = <Description content={card.content} />;
      break;
    case 'fileStats':
      res = <FileStats projectRole={state.currentRole} />;
      break;
    case 'superset':
      res = <Superset />;
      break;
    case 'userStats':
      const onExpand = () =>
        handleExpand(
          React.cloneElement(<FileStatModal />, {
            datasetId: state.currentDataset,
            currentUser: state.currentUser,
            isAdmin: state.currentRole === 'admin',
          }),
          "File Stream Advanced Search"||card.title,
          '55vw',
        );
      res = (
        <UserStats
          onExpand={onExpand}
          isAdmin={state.currentRole === 'admin'}
        />
      );
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
      res = (size, exportState, onExportClick) => {
        return <FileExplorer />;
      };
      break;
    }
    case 'datasets': {
      res = (size, exportState, onExportClick) => (
        <List
          className="demo-loadmore-list"
          itemLayout="horizontal"
          dataSource={state.children}
          renderItem={(item) => (
            <List.Item
              actions={[
                // eslint-disable-next-line
                <a key="list-loadmore-edit">
                  <Link to={`/project/${parseInt(item.id)}/canvas`}>Enter</Link>{' '}
                </a>,
                // eslint-disable-next-line
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
