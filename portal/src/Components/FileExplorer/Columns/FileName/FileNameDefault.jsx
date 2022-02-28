import React, { useContext } from 'react';
import { Popover } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { fileExplorerTableActions } from '../../../../Redux/actions';
import FileExplorerContext from '../../FileExplorerContext';
export default function FileNameTimeDefault({ text, record }) {
  const dispatch = useDispatch();
  const fileExplorerCtx = useContext(FileExplorerContext);
  const { reduxKey, dataFetcher, columnsDisplayCfg } = fileExplorerCtx;
  const isDeleted = record.archived;
  let filename = text;
  if (!filename) {
    const fileArray = record.name && record.name.split('/');
    if (fileArray && fileArray.length)
      filename = fileArray[fileArray.length - 1];
  }
  let hasPopover = false;
  let popoverContent = '';
  let textLimit = columnsDisplayCfg.deleteIndicator && isDeleted ? 35 : 45;
  if (filename && filename.length > textLimit) {
    hasPopover = true;
    popoverContent = filename;
  }

  async function goToFolder(recordGeid) {
    dispatch(
      fileExplorerTableActions.setPageSize({
        geid: reduxKey,
        param: 10,
      }),
    );
    dispatch(
      fileExplorerTableActions.setPage({
        geid: reduxKey,
        param: 0,
      }),
    );
    await dataFetcher.goToFolder(recordGeid);
    dispatch(
      fileExplorerTableActions.setCurrentGeid({
        geid: reduxKey,
        param: recordGeid,
      }),
    );
    dispatch(
      fileExplorerTableActions.setSortType({
        geid: reduxKey,
        param: 'uploaded_at',
      }),
    );
    dispatch(
      fileExplorerTableActions.setSortBy({
        geid: reduxKey,
        param: 'desc',
      }),
    );
    dispatch(
      fileExplorerTableActions.setSelections({
        geid: reduxKey,
        param: [],
      }),
    );

    dispatch(
      fileExplorerTableActions.setHardFreshKey({
        geid: reduxKey,
      }),
    );
  }
  return (
    <div
      style={{
        cursor:
          record.nodeLabel.indexOf('Folder') !== -1 ? 'pointer' : 'default',
      }}
      onClick={(e) => {
        let recordGeid = record.geid;
        if (record.nodeLabel.indexOf('Folder') !== -1) {
          goToFolder(recordGeid);
        }
      }}
    >
      {hasPopover ? (
        <Popover content={<span>{popoverContent}</span>}>
          {filename && filename.length > textLimit
            ? `${filename.slice(0, textLimit)}...`
            : filename}
        </Popover>
      ) : (
        <span>{filename}</span>
      )}
      {columnsDisplayCfg.deleteIndicator && isDeleted ? (
        <span style={{ color: '#FF6D72', fontStyle: 'italic' }}>
          {' '}
          - Deleted
        </span>
      ) : null}
    </div>
  );
}
