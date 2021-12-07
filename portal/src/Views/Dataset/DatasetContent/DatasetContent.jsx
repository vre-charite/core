import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  datasetInfoCreators,
  schemaTemplatesActions,
} from '../../../Redux/actions';
import DatasetHeader from '../Components/DatasetHeader/DatasetHeader';
import DatasetDrawer from '../Components/DatasetDrawer/DatasetDrawer';
import { Layout, Menu } from 'antd';
import {
  Switch,
  Route,
  useLocation,
  useHistory,
  useParams,
} from 'react-router-dom';
import { datasetRoutes } from '../../../Routes';
import styles from './DatasetContent.module.scss';

const { Content } = Layout;

export default function DatasetContent(props) {
  const [datasetDrawerVisibility, setDatasetDrawerVisibility] = useState(false);
  const { pathname } = useLocation();
  const { datasetCode } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(
        datasetInfoCreators.setBasicInfo({
          timeCreated: '',
          creator: '',
          title: '',
          authors: [],
          type: '',
          modality: [],
          collectionMethod: [],
          license: '',
          code: '',
          projectGeid: '',
          size: 0,
          totalFiles: 0,
          description: '',
          geid: '',
          tags: [],
        }),
      );
      dispatch(datasetInfoCreators.setDatasetVersion(''));
      dispatch(schemaTemplatesActions.updateDefaultSchemaList([]));
      dispatch(schemaTemplatesActions.updateDefaultSchemaTemplateList([]));
      dispatch(schemaTemplatesActions.setDefaultActiveKey(''));
      dispatch(schemaTemplatesActions.clearDefaultOpenTab());
      dispatch(schemaTemplatesActions.showTplDropdownList(false));
    };
  }, []);

  const tabName = getTabName(pathname);

  const clickMenu = (e) => {
    history.push(`/dataset/${datasetCode}/${e.key}`);
  };

  return (
    <Content className={styles['content']}>
      <DatasetHeader setDatasetDrawerVisibility={setDatasetDrawerVisibility} />
      <DatasetDrawer
        datasetDrawerVisibility={datasetDrawerVisibility}
        setDatasetDrawerVisibility={setDatasetDrawerVisibility}
      />
      {/*TODO: should align the menu items to the cards below, and add margin top */}
      <Menu
        className={styles['menu']}
        onClick={clickMenu}
        selectedKeys={[tabName]}
        mode="horizontal"
      >
        <Menu.Item key="home">Home</Menu.Item>
        <Menu.Item key="data">Explorer</Menu.Item>
        <Menu.Item key="schema">Metadata</Menu.Item>
        <Menu.Item key="activity">Activity</Menu.Item>
      </Menu>

      <Switch>
        {datasetRoutes.map((route) => (
          <Route
            path={'/dataset/:datasetCode' + route.path}
            render={(props) => <route.component></route.component>}
          ></Route>
        ))}
      </Switch>
    </Content>
  );
}

/**
 *
 * @param {string} pathname the pathname, like /dataset/:datasetGeid/home
 * @returns {"home"|"data"|"schema"|""}
 */
const getTabName = (pathname) => {
  const arr = pathname.split('/');
  if (arr[3]) {
    return arr[3];
  }
  return '';
};
