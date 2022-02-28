import React, { useState, useRef, useEffect } from 'react';
import { Button, Tooltip } from 'antd';
import { DownOutlined, UpOutlined, PlusOutlined } from '@ant-design/icons';
import { NEW_TAB_GEID, ESSENTIAL_TPL_NAME } from '../../GlobalDefinition';
import { schemaTemplatesActions } from '../../../../../Redux/actions';
import { useSelector, useDispatch } from 'react-redux';
import styles from './SchemaTemplates.module.scss';
import _ from 'lodash';
import RefForm from 'rc-field-form';

const SchemaTemplatesSelector = (props) => {
  const [selectDefaultValue, setSelectDefaultValue] = useState(
    'Select schema to complete',
  );

  const schemas = useSelector((state) => state.schemaTemplatesInfo.schemas);
  const defaultPanes = useSelector(
    (state) => state.schemaTemplatesInfo.defaultPanes,
  );
  let schemasTemplets = useSelector(
    (state) => state.schemaTemplatesInfo.schemaTPLs,
  );
  schemasTemplets = schemasTemplets.filter((v) => v.standard === 'default');
  const templatesDropdownList = useSelector(
    (state) => state.schemaTemplatesInfo.templatesDropdownList,
  );

  const dispatch = useDispatch();
  let dropDownListRef = useRef();
  let selectBtnRef = useRef();

  const handleClick = (e) => {
    if (
      !dropDownListRef.current.contains(e.target) &&
      !selectBtnRef.current.contains(e.target)
    ) {
      dispatch(schemaTemplatesActions.showTplDropdownList(false));
    }
  };

  useEffect(() => {
    if (templatesDropdownList) {
      document.addEventListener('click', handleClick);
    }

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [templatesDropdownList]);

  const sortNewTab = (newTabOptions) => {
    const sortedNewTabOptions = newTabOptions.sort((a, b) => {
      if (a.name > b.name) {
        return 1;
      } else if (a.name < b.name) {
        return -1;
      } else {
        return 0;
      }
    });
    return sortedNewTabOptions;
  };

  const newTabTitleOptions = (templatesType) => {
    const existingSchemasTplKeys = schemas
      .filter((el) => !el.isDraft)
      .map((el) => el.tplGeid);

    const tabOptions = schemasTemplets;

    if (templatesType === 'Default') {
      const newTabOptions = tabOptions.filter((el) => el.systemDefined);
      return sortNewTab(newTabOptions);
    } else if (templatesType === 'Custom') {
      const newTabOptions = tabOptions.filter((el) => !el.systemDefined);
      return sortNewTab(newTabOptions);
    }
  };

  const handleSelectOnClick = (element, draft) => {
    if (draft) {
      dispatch(
        schemaTemplatesActions.addDefaultOpenTab({
          title: `${element.name} / Draft`,
          key: draft.geid,
          tplKey: element.geid,
          systemDefined: element.systemDefined,
          standard: 'default',
        }),
      );
    } else {
      dispatch(
        schemaTemplatesActions.addDefaultOpenTab({
          title: `${element.name}`,
          key: NEW_TAB_GEID,
          tplKey: element.geid,
          systemDefined: element.systemDefined,
          standard: 'default',
        }),
      );
    }
    dispatch(schemaTemplatesActions.showTplDropdownList(false));
    dispatch(schemaTemplatesActions.setDefaultActiveKey(element.geid));
  };

  const schemaTemplateRender = (el) => {
    const targetSchema = schemas.find((schema) => schema.tplGeid == el.geid);
    if (targetSchema) {
      if (targetSchema.isDraft) {
        return (
          <li onClick={() => handleSelectOnClick(el, targetSchema)}>
            <p>
              {el.name.length > 15 ? (
                <Tooltip title={el.name}>{`${el.name.slice(
                  0,
                  15,
                )}... - Draft`}</Tooltip>
              ) : (
                `${el.name} - Draft`
              )}
            </p>
          </li>
        );
      } else {
        return (
          <li>
            <p
              style={{
                fontStyle: 'italic',
                fontWeight: '400',
                color: '#818181',
                opacity: 0.8,
              }}
            >
              {el.name.length > 15 ? (
                <Tooltip title={el.name}>{`${el.name.slice(
                  0,
                  15,
                )}... - Filled`}</Tooltip>
              ) : (
                `${el.name} - Filled`
              )}
            </p>
          </li>
        );
      }
    } else {
      return (
        <li onClick={() => handleSelectOnClick(el, targetSchema)}>
          <p>
            {el.name.length > 15 ? (
              <Tooltip title={el.name}>{`${el.name.slice(0, 15)}...`}</Tooltip>
            ) : (
              el.name
            )}
          </p>
        </li>
      );
    }
  };

  const handleCustomSchemaBtlClick = () => {
    dispatch(schemaTemplatesActions.switchTPLManagerMode('create'));
    dispatch(schemaTemplatesActions.showTplDropdownList(false));
  };

  return (
    <div className={styles.schema_tpl_selector}>
      <Button
        ref={selectBtnRef}
        className={styles.selectorBtn}
        onClick={() =>
          dispatch(
            schemaTemplatesActions.showTplDropdownList(!templatesDropdownList),
          )
        }
      >
        <p>
          {selectDefaultValue}
          {!templatesDropdownList ? (
            <DownOutlined style={{ marginLeft: '10px' }} />
          ) : (
            <UpOutlined style={{ marginLeft: '10px' }} />
          )}
        </p>
      </Button>
      <div ref={dropDownListRef}>
        {templatesDropdownList && (
          <>
            <div className={styles.dropdown_list_wrapper} ref={dropDownListRef}>
              <div className={styles.dropdown_list}>
                <ul>
                  {newTabTitleOptions('Default').map((el) =>
                    schemaTemplateRender(el),
                  )}
                </ul>
                <div className={styles.custom_schema_selector}>
                  <ul>
                    {newTabTitleOptions('Custom').map((el) =>
                      schemaTemplateRender(el),
                    )}
                  </ul>
                </div>
              </div>
            </div>
            <div className={styles.create_custom_schema_button}>
              <Button
                icon={<PlusOutlined />}
                onClick={() => handleCustomSchemaBtlClick()}
              >
                Create Custom Schema
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SchemaTemplatesSelector;
