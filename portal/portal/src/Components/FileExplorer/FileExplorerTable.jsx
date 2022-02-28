import React, { useState, useRef, useEffect } from 'react';
import { Table } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { getColumns, DEFAULT_COLUMN_COMP_MAP } from './Columns';
import _ from 'lodash';
import { fileExplorerTableActions } from '../../Redux/actions';
import { FileExplorerProvider } from './FileExplorerContext';
import Routing from './Routing/Routing';
import { SidePanel } from './SidePanel/SidePanel';
import { CloseOutlined } from '@ant-design/icons';
import styles from './FileExplorerTable.module.scss';

export default function FileExplorerTable(props) {
  const {
    columns,
    columnsLayout,
    reduxKey,
    projectGeid,
    initDataSource,
    routing,
    columnsDisplayCfg,
    rowClassName,
    pluginsContainer = {
      getPluginByName() {
        return {
          Widget: () => <></>,
        };
      },

      getPluginList() {
        return [];
      },
    },
    sidePanelCfg,
    dataFetcher,
  } = props;
  const dispatch = useDispatch();
  const fileExplorerTableState = useSelector(
    (state) => state.fileExplorerTable,
  );
  if (!fileExplorerTableState[reduxKey]) {
    dispatch(fileExplorerTableActions.setAdd({ geid: reduxKey }));
  }
  const {
    data,
    loading,
    pageSize,
    page,
    total,
    columnsComponentMap,
    isSidePanelOpen,
    selection,
    currentPlugin,
    refreshNum,
    hardFreshKey,
    currentGeid,
    orderType,
    orderBy,
  } = fileExplorerTableState[reduxKey] || {};
  let columnsArr = getColumns(
    columns,
    columnsLayout,
    isSidePanelOpen,
    columnsComponentMap,
  );

  const { Widget, selectionOptions } =
    pluginsContainer.getPluginByName(currentPlugin);

  useEffect(() => {
    async function init() {
      dispatch(
        fileExplorerTableActions.setColumnsCompMap({
          geid: reduxKey,
          param: DEFAULT_COLUMN_COMP_MAP,
        }),
      );

      await dataFetcher.init(initDataSource.value.id);
      dispatch(
        fileExplorerTableActions.setHardFreshKey({
          geid: reduxKey,
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
    }
    init();
    return () => {
      dispatch(fileExplorerTableActions.clear({ geid: reduxKey }));
    };
    //dataFetcher.init();
  }, [reduxKey]);

  useEffect(() => {
    async function refreshTable() {
      const isRoot = currentGeid === initDataSource.value.id;
      await dataFetcher.refresh(currentGeid, isRoot);
    }
    if (refreshNum) {
      refreshTable();
    }
    //dataFetcher.refresh();
  }, [refreshNum]);

  if (isSidePanelOpen) {
    columnsArr = columnsArr.filter((column) => column.sidePanelVisible);
  }

  const defaultSelectionOptions = {
    selectedRowKeys: selection
      ? selection.map((v) => v.geid).filter((v) => !!v)
      : [],
    onChange: (selectedRowKeys, selectedRows) => {
      dispatch(
        fileExplorerTableActions.setSelections({
          geid: reduxKey,
          param: selectedRows,
        }),
      );
    },
  };

  const onChange = (pagination, filters, sorter) => {
    const sort = sorter.field ? sorter.field : 'uploaded_at';
    const order = sorter.order ? sorter.order : 'desc';
    const isRoot = currentGeid === initDataSource.value.id;
    dispatch(
      fileExplorerTableActions.setPage({
        geid: reduxKey,
        param: pagination.current - 1,
      }),
    );

    dataFetcher.changeSorterAndPagination(
      currentGeid,
      isRoot,
      pagination.current - 1,
      sort,
      order,
      filters,
    );
    dispatch(
      fileExplorerTableActions.setSortType({
        geid: reduxKey,
        param: sort,
      }),
    );
    dispatch(
      fileExplorerTableActions.setSortBy({
        geid: reduxKey,
        param: order,
      }),
    );
  };

  return (
    <FileExplorerProvider
      value={{
        reduxKey: reduxKey,
        projectGeid: projectGeid,
        initDataSource: initDataSource,
        routing: routing,
        columnsDisplayCfg: columnsDisplayCfg,
        sidePanelCfg: sidePanelCfg,
        dataFetcher,
      }}
    >
      <div style={{ position: 'relative', height: '100%' }}>
        <div style={{ position: 'relative' }}>
          <Routing />
          <div style={{ display: 'inline-block' }}>
            {currentPlugin ? (
              <Widget />
            ) : (
              <>
                {pluginsContainer.getPluginList().map((plugin) => {
                  const { Entry, condition } = plugin;
                  return (
                    condition(fileExplorerTableState[reduxKey]) && (
                      <Entry key={plugin.name} />
                    )
                  );
                })}
              </>
            )}
          </div>
          {selection && selection.length ? (
            <div
              className={styles.selected_files}
              /* style={{
                position: 'absolute',
                right: 40,
                top: 10,
                fontSize: 14,
                fontWeight: 500,
              }} */
            >
              Selected {selection.filter((v) => !!v).length}{' '}
              {selection.filter((v) => !!v).length > 1 ? 'items' : 'item'}
              <CloseOutlined
                style={{ marginLeft: 10, cursor: 'pointer' }}
                onClick={() => {
                  dispatch(
                    fileExplorerTableActions.setSelections({
                      geid: reduxKey,
                      param: [],
                    }),
                  );
                }}
              />
            </div>
          ) : null}
        </div>
        <div style={{ display: 'flex', height: '100%' }}>
          <Table
            className={
              isSidePanelOpen
                ? styles['table-side-panel-open']
                : styles['table-side-panel-closed']
            }
            id="files_table"
            columns={columnsArr}
            dataSource={data}
            onChange={onChange}
            key={hardFreshKey}
            pagination={{
              current: page + 1,
              pageSize,
              total: total,
              pageSizeOptions: [10, 20, 50],
              showQuickJumper: true,
              showSizeChanger: true,
              onShowSizeChange: (current, size) => {
                dispatch(
                  fileExplorerTableActions.setPageSize({
                    geid: reduxKey,
                    param: size,
                  }),
                );
                dispatch(
                  fileExplorerTableActions.setPage({
                    geid: reduxKey,
                    param: 0,
                  }),
                );
                dataFetcher.changePageSize(
                  initDataSource.value.id,
                  true,
                  pageSize,
                );
              },
              onChange: (page, pageSize) => {
                dispatch(
                  fileExplorerTableActions.setPage({
                    geid: reduxKey,
                    param: page - 1,
                  }),
                );
                dataFetcher.pageTo(initDataSource.value.id, true, page);
              },
            }}
            loading={loading}
            tableLayout="fixed"
            rowKey={(record) => record.geid}
            rowSelection={
              columnsDisplayCfg && columnsDisplayCfg.hideSelectBox
                ? null
                : _.assign(
                    _.cloneDeep(defaultSelectionOptions),
                    selectionOptions,
                  )
            }
            /* rowSelection={{ ...this.props.rowSelection, columnWidth: 40 }} */
            rowClassName={rowClassName ? rowClassName : (record) => {}}
          />
          {isSidePanelOpen && <SidePanel reduxKey={reduxKey} />}
        </div>
      </div>
    </FileExplorerProvider>
  );
}
