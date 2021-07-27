import React from 'react';
import DatasetHeader from '../Components/DatasetHeader/DatasetHeader';
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
  const { pathname } = useLocation();
  const { datasetCode } = useParams();
  const history = useHistory();

  const tabName = getTabName(pathname);

  const clickMenu = (e) => {
    history.push(`/dataset/${datasetCode}/${e.key}`);
  };

  return (
    <Content className={styles['content']}>
      <DatasetHeader />
      {/*TODO: should align the menu items to the cards below, and add margin top */}
      <Menu
        className={styles['menu']}
        onClick={clickMenu}
        selectedKeys={[tabName]}
        mode="horizontal"
      >
        <Menu.Item key="home">Home</Menu.Item>
        <Menu.Item key="data">Data</Menu.Item>
        <Menu.Item key="activity">Activity</Menu.Item>
        {/* <Menu.Item key="schema">Schema</Menu.Item> */}
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
