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
