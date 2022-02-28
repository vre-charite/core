import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Tabs, message, Button } from 'antd';
import styles from './index.module.scss';
import SchemasTabContents from './SchemasTabContents';
import OpenMindsSchemaTabContents from './openMindsSchemasTabContents';
import UploadSchemaModal from './UploadSchemaModal/UploadSchemaModal';
import {
  deleteDatasetSchemaData,
  getDatasetSchemaListAPI,
} from '../../../../../APIs';
import { DeleteOutlined, FileOutlined, EyeOutlined } from '@ant-design/icons';
import { ESSENTIAL_SCHEMA_NAME } from '../../GlobalDefinition';
import { schemaTemplatesActions } from '../../../../../Redux/actions';
import { useTranslation } from 'react-i18next';
import { PLATFORM } from '../../../../../config';

const { TabPane } = Tabs;

export function ExistingSchemaContents(props) {
  const [schemaGeid, setSchemaGeid] = useState('');
  const [modalVisibility, setModalVisibility] = useState(false);
  const [delLoading, setDelLoading] = useState(false);
  const datasetInfo = useSelector((state) => state.datasetInfo.basicInfo);
  const schemas = useSelector((state) => state.schemaTemplatesInfo.schemas);
  const defaultPanes = useSelector(
    (state) => state.schemaTemplatesInfo.defaultPanes,
  );
  const schemasTPLs = useSelector(
    (state) => state.schemaTemplatesInfo.schemaTPLs,
  );
  const defaultSchemaActiveKey = useSelector(
    (state) => state.schemaTemplatesInfo.defaultSchemaActiveKey,
  );
  const templateManagerMode = useSelector(
    (state) => state.schemaTemplatesInfo.templateManagerMode,
  );
  const dispatch = useDispatch();
  const { t } = useTranslation(['errormessages', 'success']);

  useEffect(() => {
    setSchemaGeid(defaultSchemaActiveKey);
  }, [defaultSchemaActiveKey]);

  const handleEditSchema = (item) => {
    if (item.standard === 'open_minds') {
      dispatch(schemaTemplatesActions.setPreviewSchemaGeid(item.geid));
    } else {
      const schemaTPL = schemasTPLs.find((tpl) => tpl.geid === item.tplGeid);
      dispatch(
        schemaTemplatesActions.addDefaultOpenTab({
          title: schemaTPL.name,
          key: item.geid,
          tplKey: schemaTPL.geid,
          systemDefined: item.systemDefined,
          standard: item.standard,
        }),
      );
      dispatch(schemaTemplatesActions.setDefaultActiveKey(schemaTPL.geid));
    }
  };

  const handleOnClick = (item) => {
    if (!defaultSchemaActiveKey) {
      setSchemaGeid(item.geid);
    } else {
      setSchemaGeid(item.geid);
    }
  };

  const getDatasetSchemaList = async () => {
    try {
      const res = await getDatasetSchemaListAPI(datasetInfo.geid);
      dispatch(schemaTemplatesActions.updateDefaultSchemaList(res.data.result));
    } catch (error) {
      message.error(t('errormessages:datasetSchemaList.default.0'));
    }
  };

  const deleteSchema = async (item) => {
    setDelLoading(true);
    try {
      const res = await deleteDatasetSchemaData(
        datasetInfo.geid,
        item.geid,
        item.name,
      );
      await getDatasetSchemaList();
      dispatch(schemaTemplatesActions.removeDefaultOpenTab(item.tplGeid));
      let newActiveKey;
      const newPanes = defaultPanes.filter((el) => el.key !== item.geid);
      if (newPanes.length === 0) {
        newActiveKey = '';
      } else {
        newActiveKey = newPanes[0].tplKey;
      }
      dispatch(schemaTemplatesActions.setDefaultActiveKey(newActiveKey));
    } catch (e) {}

    setDelLoading(false);
  };

  const schemaActionButtons = (item) => (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        icon={<EyeOutlined />}
        style={{ border: '0px', backgroundColor: '#E6F5FF' }}
        disabled={templateManagerMode !== 'hide'}
        onClick={() => handleEditSchema(item)}
      />
      {item.name === ESSENTIAL_SCHEMA_NAME ? (
        <div style={{ marginRight: '15px' }}></div>
      ) : (
        <Button
          icon={<DeleteOutlined />}
          loading={delLoading}
          onClick={(e) => {
            deleteSchema(item);
          }}
          style={{
            border: '0px',
            backgroundColor: '#E6F5FF',
            marginRight: '15px',
          }}
        />
      )}
    </div>
  );

  const tabContentStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '44px',
    borderBottom: '1px solid #0000001A',
    cursor: 'pointer',
  };

  /*   const editingDraft =
    defaultPanes &&
    defaultPanes.find((pane) => {
      return schemas.find(
        (schema) => schema.isDraft && schema.tplGeid == pane.tplKey,
      );
    });

  let addMode;
  if (defaultPanes.length === 0) {
    addMode = false;
  } else {
    addMode = defaultSchemaActiveKey === NEW_TAB_GEID || editingDraft;
  } */

  const schemasTabTitle = (
    <div>
      <p style={{ fontWeight: '600', color: '#222222', margin: '0px' }}>
        {PLATFORM} Schemas
      </p>
    </div>
  );

  const openMindsSchemasTabTitle = (
    <div>
      <p style={{ fontWeight: '600', color: '#222222', margin: '0px' }}>
        openMINDS Schemas
      </p>
    </div>
  );

  const onTabSelChange = (activeKey) => {
    dispatch(schemaTemplatesActions.setSchemaTypes(activeKey));
  };
  return (
    <div
      style={{ height: '100%', position: 'relative' }}
      className={styles['tabs']}
    >
      <Tabs tabPosition={'left'} onChange={onTabSelChange}>
        <TabPane tab={schemasTabTitle} key="Default">
          <SchemasTabContents
            setSchemaGeid={setSchemaGeid}
            schemaGeid={schemaGeid}
            schemas={schemas}
            handleOnClick={handleOnClick}
            schemaActionButtons={schemaActionButtons}
            tabContentStyle={tabContentStyle}
          />
        </TabPane>
        <TabPane tab={openMindsSchemasTabTitle} key="OpenMinds">
          <OpenMindsSchemaTabContents
            setModalVisibility={setModalVisibility}
            schemaGeid={schemaGeid}
            schemas={schemas}
            handleOnClick={handleOnClick}
            schemaActionButtons={schemaActionButtons}
            tabContentStyle={tabContentStyle}
          />
        </TabPane>
      </Tabs>
      <UploadSchemaModal
        visibility={modalVisibility}
        setModalVisibility={setModalVisibility}
      />
    </div>
  );
}
