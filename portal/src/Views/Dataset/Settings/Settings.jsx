import React from 'react';
import { PageHeader, Tabs, Row, Col, Layout } from 'antd';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { withCurrentProject } from '../../../Utility';
import styles from './index.module.scss';
import GeneralInfo from './Tabs/GeneralInfo/GeneralInfo';
import FileManifest from './Tabs/FileManifest/FileManifest';
const { Content } = Layout;
const { TabPane } = Tabs;
function Settings(props) {
  const { role } = useSelector((state) => state);
  const projectName = props.currentProject?.name;
  const routes = [
    {
      path: '/landing',
      breadcrumbName: 'Projects',
    },
    {
      path: `/project/${props.datasetId}/canvas`,
      breadcrumbName: projectName,
    },
    {
      path: 'second',
      breadcrumbName: 'Settings',
    },
  ];

  function itemRender(route, params, routes, paths) {
    const index = routes.indexOf(route);
    if (index === 0) {
      return <Link to={route.path}>{route.breadcrumbName}</Link>;
    } else if (index === 1) {
      return (
        <span
          style={{
            maxWidth: 'calc(100% - 74px)',
            display: 'inline-block',
            verticalAlign: 'bottom',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <Link to={route.path}>{route.breadcrumbName}</Link>
        </span>
      );
    } else {
      return <>{route.breadcrumbName}</>;
    }
  }
  return (
    <>
      <Content className={'content'}>
        <Row style={{ paddingBottom: '10px' }}>
          <Col
            span={24}
            style={{
              paddingTop: '10px',
            }}
          >
            <PageHeader
              ghost={false}
              style={{
                border: '1px solid rgb(235, 237, 240)',
                width: '-webkit-fill-available',
                marginTop: '10px',
                marginBottom: '25px',
              }}
              title={
                <span
                  style={{
                    maxWidth: '1000px',
                    display: 'inline-block',
                    verticalAlign: 'bottom',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Project: {projectName}
                </span>
              }
              subTitle={`Your role is ${
                role === 'admin'
                  ? 'Platform Administrator'
                  : 'Project Administrator'
              }.`}
              breadcrumb={{ routes, itemRender }}
            />
            <Tabs type="card" className={styles.custom_tabs}>
              <TabPane tab="General Information" key="general_info">
                <div style={{ backgroundColor: 'white' }}>
                  <GeneralInfo />
                </div>
              </TabPane>
              <TabPane tab="File Manifests" key="file_manifest">
                <div style={{ backgroundColor: 'white' }}>
                  <FileManifest />
                </div>
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </Content>
    </>
  );
}
export default withCurrentProject(Settings);
