import React, { useState } from 'react';
import { Tabs } from 'antd';
import MyDatasetsList from '../Components/MyDatasetList/MyDatasetsList';
import styles from './index.module.scss';
import DatasetListActions from '../Components/DatasetListActions/DatasetListActions';
import CreateDatasetPanel from '../Components/CreateDatasetPanel/CreateDatasetPanel';

const { TabPane } = Tabs;

const ACTIONS = { default: 'default', search: 'search', create: 'create' };

function DatasetLandingContent(props) {
  const [action, setAction] = useState(ACTIONS.default);

  return (
    <div className={styles.tab}>
      <Tabs
        tabBarExtraContent={
          <DatasetListActions
            ACTIONS={ACTIONS}
            action={action}
            setAction={setAction}
          />
        }
      >
        <TabPane tab="My Datasets" key="My Datasets">
          {action === ACTIONS.create && (
            <CreateDatasetPanel
              ACTIONS={ACTIONS}
              action={action}
              setAction={setAction}
            />
          )}
          <MyDatasetsList />
        </TabPane>
        {/* <TabPane tab="All Datasets" key="All Datasets">
        All Datasets
      </TabPane> */}
      </Tabs>
    </div>
  );
}

export default DatasetLandingContent;
