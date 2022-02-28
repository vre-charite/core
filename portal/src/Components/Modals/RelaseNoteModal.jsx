import React, { useState } from 'react';
import { Modal, Select, BackTop } from 'antd';
import { UpCircleTwoTone } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import semver from 'semver';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import { setIsReleaseNoteShownCreator } from '../../Redux/actions';
import parse from 'html-react-parser';
import { PORTAL_PREFIX } from '../../config';


const { Option } = Select;
function ReleaseNoteModal({ currentVersion, visible }) {
  const dispatch = useDispatch();
  const [version, setVersion] = useState(currentVersion);
  const { t } = useTranslation(['releaseVersion'], {
    useSuspense: false,
  });
  const versionsArr = t(`releaseVersion:versions`, { returnObjects: true });
  return (
    <Modal
      style={{ transform: 'translateZ(0)' }}
      maskClosable={false}
      footer={[
        <>
          <Select
            onChange={(value) => {
              setVersion(value);
            }}
            defaultValue={currentVersion}
            style={{ width: 160, textAlign: 'left' }}
          >
            {versionsArr.map &&
              versionsArr.map((item) => {
                return (
                  <Option value={item.version} key={item.version}>
                    <b>{`${item.version}(${item.date})`}</b>
                  </Option>
                );
              })}
            <Option value="all">
              <b>All</b>
            </Option>
          </Select>
        </>,
      ]}
      title={
        <>
          <img
            alt="release note"
            width={25}
            src={PORTAL_PREFIX + '/Rocket.svg'}
          ></img>{' '}
          <b>
            {`Release Note ${version === 'all' ? ' (all)' : version}` +
              getSuffix(version, currentVersion)}
          </b>
        </>
      }
      visible={visible}
      onCancel={() => {
        dispatch(setIsReleaseNoteShownCreator(false));
      }}
    >
      <div
        id={'releaseNoteDiv'}
        style={{ maxHeight: '50vh', overflow: 'auto' }}
      >
        {version === 'all'
          ? parse(
              versionsArr
                .map((item) => `<h2>Release ${item.version}</h2>` + item.note)
                .join('<hr/>'),
            )
          : parse(
              _.find(versionsArr, (item) => {
                return item.version === version;
              })?.note || '',
            )}
      </div>
      <BackTop
        style={{
          position: 'fixed',
          left: '80%',
          bottom: '100px',
          transform: 'translateX(-50%)',
          cursor: 'default',
        }}
        visibilityHeight={200}
        target={() => document.getElementById('releaseNoteDiv')}
      >
        <UpCircleTwoTone style={{ cursor: 'pointer' }} />
      </BackTop>
    </Modal>
  );
}

const getSuffix = (version, currentVersion) => {
  if (version === 'all') {
    return '';
  } else if (semver.eq(version, currentVersion)) {
    return ' (current)';
  } else {
    return ' (past)';
  }
};

export default ReleaseNoteModal;
