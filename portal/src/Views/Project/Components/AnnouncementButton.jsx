import React, { useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import {
  getAnnouncementApi,
  getUserAnnouncementApi,
  putUserAnnouncementApi,
} from '../../../APIs';
import { Link } from 'react-router-dom';
import { message, List, Popover, Tooltip } from 'antd';
import { NotificationOutlined, DownCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import styles from './index.module.scss';
import { ErrorMessager, namespace } from '../../../ErrorMessages';

//let setTimeoutId; // will this cause issue if there are more than 1 instance?
export default function AnnouncementButton({ currentProject }) {
  const [announcements, setAnnouncements] = useState([]);
  const [unread, setUnread] = useState(false);
  const { keycloak } = useKeycloak();
  const [loadMore, setLoadMore] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [timeReach, setTimeReach] = useState(false);
  const [visible, setVisible] = useState(false);
  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  }
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions(),
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const panelMaxHeight = windowDimensions.height - 240;
  const content = (
    <div
      style={{ width: '100%', maxHeight: panelMaxHeight, overflow: 'hidden' }}
    >
      <div
        style={{
          width: '100%',
          maxHeight: panelMaxHeight,
          overflowY: 'scroll',
          paddingRight: 17,
          boxSizing: 'content-box',
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={loadMore ? announcements : announcements.slice(0, 1)}
          renderItem={(announcement) => (
            <List.Item className={styles.annoucementPanelItem}>
              <List.Item.Meta
                description={
                  <span
                    style={{ whiteSpace: 'pre-line', wordBreak: 'break-all' }}
                  >
                    {announcement.content}
                  </span>
                }
                title={`${announcement.publisher} ${moment(
                  announcement.date + 'Z',
                ).format('MMMM Do YYYY, h:mm:ss a')}`}
              />
            </List.Item>
          )}
        ></List>
        {!loadMore && (
          <div
            style={{
              float: 'right',
              cursor: 'pointer',
              marginTop: 20,
              marginBottom: 10,
            }}
            onClick={() => {
              setLoadMore(true);
            }}
          >
            <span style={{ color: '#EDF1F4', fontSize: 12, marginRight: 10 }}>
              Load More
            </span>
            <div
              style={{
                position: 'relative',
                verticalAlign: 'middle',
                display: 'inline-block',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 1,
                  top: 3,
                  background: 'white',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                }}
              ></div>
              <DownCircleOutlined
                style={{
                  color: '#1890FF',
                  fontSize: '20px',
                  position: 'relative',
                  verticalAlign: 'middle',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  useEffect(() => {
    async function inner() {
      const username = keycloak?.tokenParsed?.preferred_username;
      if (currentProject?.code) {
        let announcementsRaw = [];
        try {
          const res = await getAnnouncementApi({
            projectCode: currentProject?.code,
            pageSize: 10,
          });
          const userRes = await getUserAnnouncementApi(username);
          announcementsRaw = res?.data?.result?.result;
          setAnnouncements(announcementsRaw);
          const latestAnnouncementId =
            userRes.data.result[
              _.camelCase(`announcement_${currentProject?.code}`)
            ];
          if (announcementsRaw.length) {
            if (!latestAnnouncementId && announcementsRaw[0]?.id) {
              setUnread(true);
            }
            if (
              latestAnnouncementId &&
              announcementsRaw[0]?.id !== latestAnnouncementId
            ) {
              setUnread(true);
            }
          }
        } catch (err) {
          console.log(err);
          const errorMessage = new ErrorMessager(
            namespace.announcement.getUserAnnouncementApi,
          );
          errorMessage.triggerMsg(null, null, {
            projectCode: currentProject?.code,
          });
          /*           message.error(
            `Failed to get announcements for project ${currentProject?.code}`,
          ); */
        }
      }
    }
    inner();
  }, [currentProject.code]);

  const onClick = () => {
    setUnread(false);
    putUserAnnouncementApi(
      keycloak.tokenParsed.preferred_username,
      currentProject?.code,
      announcements[0]?.id,
    );
  };
  const onMouseEnter = () => {
    if (!visible) {
      const timeoutId = setTimeout(() => {
        setTimeReach(true);
        clearTimeout(timeoutId);
      }, 2 * 1000);
      setTimeoutId(timeoutId);
    }
  };
  const onMouseLeave = () => {
    if (!visible) {
      clearTimeout(timeoutId);
    }
  };

  const onVisibleChange = (visible) => {
    setVisible(visible);
    if (timeReach && !visible) {
      setUnread(false);
      putUserAnnouncementApi(
        keycloak.tokenParsed.preferred_username,
        currentProject?.code,
        announcements[0]?.id,
      );
    }
    if (!visible) {
      clearTimeout(timeoutId);
    }
  };

  return (
    <>
      {unread ? (
        <Popover
          overlayClassName={styles.annoucementPanel}
          content={content}
          mouseEnterDelay={0.5}
          placement="rightTop"
          title={'Announcements'}
          onVisibleChange={onVisibleChange}
          getPopupContainer={() => {
            return document.getElementById('layout-wrapper');
          }}
        >
          <div
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <Link to="announcement">
              <NotificationOutlined style={{ color: 'tomato' }} />
            </Link>
          </div>
        </Popover>
      ) : (
        <Tooltip title="Announcements" placement="left">
          <Link to="announcement">
            <NotificationOutlined />
          </Link>
        </Tooltip>
      )}
    </>
  );
}
