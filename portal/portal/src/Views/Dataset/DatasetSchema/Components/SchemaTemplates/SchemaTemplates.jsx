import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { schemaTemplatesActions } from '../../../../../Redux/actions';
import { Tabs, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import SchemaTemplatesSelector from './SchemaTemplatesSelector';
import SchemaForm from '../SchemaForm/SchemaForm';
import styles from './SchemaTemplates.module.scss';
import { NEW_TAB_GEID, ESSENTIAL_TPL_NAME } from '../../GlobalDefinition';
import _ from 'lodash';
import CustomizedSchema from '../CustomizedSchema/CustomizedSchema';
import { BlankPreviewerCard } from '../../../DatasetData/Components/DatasetDataPreviewer/BlankPreviewerCard/BlankPreviewerCard';
import { OpenMindsPreviewer } from '../OpenMindsPreviewer/OpenMindsPreviewer';

const { TabPane } = Tabs;

const SchemaTemplates = (props) => {
  const defaultPanes = useSelector(
    (state) => state.schemaTemplatesInfo.defaultPanes,
  );
  const dispatch = useDispatch();
  const defaultSchemaActiveTabKey = useSelector(
    (state) => state.schemaTemplatesInfo.defaultSchemaActiveKey,
  );
  const schemas = useSelector((state) => state.schemaTemplatesInfo.schemas);
  const templateManagerMode = useSelector(
    (state) => state.schemaTemplatesInfo.templateManagerMode,
  );
  const schemasTypes = useSelector(
    (state) => state.schemaTemplatesInfo.schemaTypes,
  );
  const schemaPreviewGeid = useSelector(
    (state) => state.schemaTemplatesInfo.schemaPreviewGeid,
  );
  const editingDraft =
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
    addMode = defaultSchemaActiveTabKey === NEW_TAB_GEID || editingDraft;
  }

  // panel tab changes
  const handleDefaultSchemaTabChange = (activeKey) => {
    dispatch(schemaTemplatesActions.setDefaultActiveKey(activeKey));
  };

  const removeTab = (targetTplKey, type) => {
    if (type === 'Default') {
      let newActiveKey = defaultSchemaActiveTabKey;
      let lastIndex;
      dispatch(schemaTemplatesActions.removeDefaultOpenTab(targetTplKey));
      for (let i = 0; i < defaultPanes.length; i++) {
        if (defaultPanes[i].tplKey === targetTplKey) {
          lastIndex = i - 1;
        }
      }
      const newPanes = defaultPanes.filter((el) => el.tplKey !== targetTplKey);
      if (newPanes.length && newActiveKey === targetTplKey) {
        if (lastIndex >= 0) {
          newActiveKey = newPanes[lastIndex].tplKey;
        } else {
          newActiveKey = newPanes[0].tplKey;
        }
      }
      dispatch(schemaTemplatesActions.setDefaultActiveKey(newActiveKey));
    }
  };

  const handleTabsPanelEdit = (targetTplKey, action, type) => {
    if (action === 'remove') {
      removeTab(targetTplKey, type);
    }
  };

  return (
    <div className={styles.schema_editor_wrapper}>
      {templateManagerMode === 'hide' &&
      schemasTypes === 'Default' &&
      defaultPanes.length ? (
        <SchemaTemplatesSelector />
      ) : null}

      {schemasTypes === 'Default' &&
        (defaultPanes.length ? (
          <div className={styles.tabs}>
            <Tabs
              type="editable-card"
              hideAdd={true}
              onChange={handleDefaultSchemaTabChange}
              activeKey={defaultSchemaActiveTabKey}
              onEdit={(targetTplKey, action) =>
                handleTabsPanelEdit(targetTplKey, action, 'Default')
              }
            >
              {defaultPanes.map((pane) => (
                <TabPane
                  tab={pane.title}
                  key={pane.tplKey}
                  closable={pane.title !== ESSENTIAL_TPL_NAME}
                  // disabled={addMode && defaultSchemaActiveTabKey !== pane.key}
                >
                  <SchemaForm pane={pane}></SchemaForm>
                </TabPane>
              ))}
            </Tabs>
          </div>
        ) : (
          <Spin
            indicator={<LoadingOutlined />}
            className={styles.loading_icon}
            size="large"
          />
        ))}
      {schemasTypes === 'OpenMinds' ? (
        schemaPreviewGeid ? (
          <div className="json_previwer">
            <OpenMindsPreviewer />
          </div>
        ) : (
          <BlankPreviewerCard />
        )
      ) : null}
      {templateManagerMode !== 'hide' ? (
        <div className="schema_tpl_manager">
          <CustomizedSchema />
        </div>
      ) : null}
    </div>
  );
};

export default SchemaTemplates;
