import React, { useState, useRef, useEffect, useContext } from 'react';
import { Tooltip as Tip, Breadcrumb } from 'antd';
import styles from '../index.module.scss';
import FileExplorerContext from '../FileExplorerContext';
import { useSelector, useDispatch } from 'react-redux';
import { fileExplorerTableActions } from '../../../Redux/actions';
export default function Routing(props) {
  const fileExplorerCtx = useContext(FileExplorerContext);
  const dispatch = useDispatch();
  const fileExplorerTableStates = useSelector(
    (state) => state.fileExplorerTable,
  );
  const { routing, initDataSource, projectGeid, reduxKey, dataFetcher } =
    fileExplorerCtx;
  const { route } = fileExplorerTableStates[fileExplorerCtx.reduxKey] || [];

  const orderRouting =
    route &&
    route
      .filter((x) => x.labels.indexOf('Container') === -1)
      .sort((a, b) => {
        return a.folderLevel - b.folderLevel;
      });
  const startRoutingInd =
    routing && routing.startGeid
      ? orderRouting.findIndex(
          (elem) => elem.globalEntityId === routing.startGeid,
        )
      : -1;
  const cutRouting = orderRouting.slice(
    startRoutingInd + 1,
    orderRouting.length,
  );
  const lastThree = cutRouting.slice(-3);
  return (
    <div className={`${styles.route_wrapper}`}>
      <Breadcrumb
        separator=">"
        style={{ maxWidth: 500, display: 'inline-block' }}
        className={`${styles.file_folder_path}`}
      >
        <Breadcrumb.Item
          style={{ cursor: 'pointer' }}
          onClick={async () => {
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
            await dataFetcher.goToRoute(initDataSource.value.id,true);
            dispatch(
              fileExplorerTableActions.setHardFreshKey({
                geid: reduxKey,
              }),
            );
            dispatch(
              fileExplorerTableActions.setSelections({
                geid: reduxKey,
                param: [],
              }),
            );
            dispatch(
              fileExplorerTableActions.setCurrentGeid({
                geid: reduxKey,
                param: initDataSource.value.id,
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
          }}
        >
          Request
        </Breadcrumb.Item>
        {cutRouting.length >= 4 ? <Breadcrumb.Item>...</Breadcrumb.Item> : null}
        {lastThree.map((v, ind) => {
          let geid = v.globalEntityId;
          if (v.displayPath === props.username) {
            geid = null;
          }
          return (
            <Breadcrumb.Item
              style={
                lastThree.length === ind + 1 ? null : { cursor: 'pointer' }
              }
              onClick={async () => {
                if (lastThree.length === ind + 1) return;
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
                dispatch(
                  fileExplorerTableActions.setHardFreshKey({
                    geid: reduxKey,
                  }),
                );
                dispatch(
                  fileExplorerTableActions.setSelections({
                    geid: reduxKey,
                    param: [],
                  }),
                );
                dispatch(
                  fileExplorerTableActions.setCurrentGeid({
                    geid: reduxKey,
                    param: v.globalEntityId,
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
                dataFetcher.goToRoute(v.globalEntityId,false);
              }}
            >
              {v.name.length > 23 ? (
                <Tip title={v.name}>{v.name.slice(0, 20) + '...'}</Tip>
              ) : (
                v.name
              )}
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    </div>
  );
}
