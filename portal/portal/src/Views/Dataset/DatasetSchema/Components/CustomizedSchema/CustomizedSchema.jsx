import { Form, Button, Modal, message } from 'antd';
import React, { useEffect, useState } from 'react';
import SchemaFormInternal from './SchemaFormInternal/SchemaFormInternal';
import { CloseOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons';
import {
  createDatasetSchemaTPL,
  getCustomSchemaTPLDetail,
  deleteDatasetSchemaData,
  getDatasetSchemaListAPI,
  getSchemaDataDetail,
  createSchemaData,
  getDatasetDefaultSchemaTemplateListAPI,
  getDatasetCustomSchemaTemplateListAPI,
} from '../../../../../APIs/dataset';
import { trimString } from '../../../../../Utility';
import { useDispatch, useSelector } from 'react-redux';
import { schemaTemplatesActions } from '../../../../../Redux/actions';
import { NEW_TAB_GEID } from '../../GlobalDefinition';
import _ from 'lodash';
import styles from './CustomizedSchema.module.scss';
import { useTranslation } from 'react-i18next';
export default function CustomizedSchema(props) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { t } = useTranslation(['errormessages', 'success']);
  const { username } = useSelector((state) => state);
  const datasetInfo = useSelector((state) => state.datasetInfo.basicInfo);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const templateManagerMode = useSelector(
    (state) => state.schemaTemplatesInfo.templateManagerMode,
  );
  const defaultSchemaActiveTabKey = useSelector(
    (state) => state.schemaTemplatesInfo.defaultSchemaActiveKey,
  );
  const schemas = useSelector((state) => state.schemaTemplatesInfo.schemas);
  const schemaTPLs = useSelector(
    (state) => state.schemaTemplatesInfo.schemaTPLs,
  );
  const datasetGeid = datasetInfo.geid;
  const [updateConfirmationModal, setUpdateConfirmationModal] = useState(false);
  const selTPL = schemaTPLs.find(
    (tpl) => tpl.geid === defaultSchemaActiveTabKey,
  );
  const [curSchemaTPLContent, setCurSchemaTPLContent] = useState(null);
  function propertyMap(item) {
    if (item.type === 'text') {
      return {
        type: 'string',
        title: item.title,
        maxLength: 50,
      };
    }
    if (item.type === 'multiple-choice') {
      return {
        type: 'string',
        title: item.title,
        enum: item.value,
        maxLength: 20,
      };
    }
    if (item.type === 'numeric') {
      return {
        type: 'integer',
        title: item.title,
        maximum: 9999,
      };
    }
    if (item.type === 'date-picker') {
      return {
        title: item.title,
        type: 'string',
        format: 'date',
      };
    }
  }
  function convertForm2SchemaTPL(templateItems) {
    templateItems = templateItems.map((v) => {
      v['key'] = trimString(v.title).replace(/\s/g, '_').toLowerCase();
      return v;
    });
    const ui = {};
    const schema = {
      type: 'object',
      properties: {},
    };
    const required = templateItems.filter((v) => !v.optional);
    schema.required = required.map((v) => v.key);
    let properties = {};
    for (let i = 0; i < templateItems.length; i++) {
      const templateItem = templateItems[i];
      properties[templateItem['key']] = propertyMap(templateItem);
    }
    schema.properties = properties;
    return {
      schema,
      ui,
    };
  }
  function convertSchemaTPL2From(schema) {
    const schemaJson = schema.content.schema;
    const templateItems = Object.keys(schemaJson.properties).map((fieldKey) => {
      const field = schemaJson.properties[fieldKey];
      const required = schemaJson.required.indexOf(fieldKey) !== -1;
      const title = field.title;
      if (field.type === 'string') {
        if (field.enum) {
          return {
            type: 'multiple-choice',
            title: title,
            value: field.enum,
            optional: !required,
          };
        } else if (field.format === 'date') {
          return {
            type: 'date-picker',
            title: title,
            value: '',
            optional: !required,
          };
        } else {
          return {
            type: 'text',
            title: title,
            value: '',
            optional: !required,
          };
        }
      }
      if (field.type === 'integer') {
        return {
          type: 'numeric',
          title: title,
          value: '',
          optional: !required,
        };
      }
    });
    return {
      templateName: schema.name,
      templateItems,
    };
  }

  const getDatasetSchemaList = async () => {
    try {
      const res = await getDatasetSchemaListAPI(datasetGeid);
      dispatch(schemaTemplatesActions.updateDefaultSchemaList(res.data.result));
    } catch (error) {
      message.error(t('errormessages:datasetSchemaList.default.0'));
    }
  };
  const getSchemaTemplates = async () => {
    try {
      const res = await getDatasetDefaultSchemaTemplateListAPI();
      const resCustom = await getDatasetCustomSchemaTemplateListAPI(
        datasetInfo.geid,
      );
      dispatch(
        schemaTemplatesActions.updateDefaultSchemaTemplateList([
          ...res.data.result,
          ...resCustom.data.result,
        ]),
      );
      return res.data.result;
    } catch (error) {
      message.error(t('errormessages:datasetSchemaTemplateList.default.0'));
    }
  };
  const onFinish = async (values) => {
    setLoading(true);
    if (!values.templateItems || values.templateItems.length < 1) {
      message.error(t('errormessages:customizeSchema.itemRequired.0'));
      setLoading(false);
      return;
    }
    try {
      const schemaTPL = convertForm2SchemaTPL(
        _.cloneDeep(values.templateItems),
      );

      if (templateManagerMode === 'create') {
        if (datasetGeid && values.templateName && schemaTPL) {
          const res = await createDatasetSchemaTPL(
            datasetGeid,
            values.templateName,
            schemaTPL,
            username,
          );
          await getSchemaTemplates();
          if (res.data.result) {
            const item = res.data.result;
            dispatch(
              schemaTemplatesActions.addDefaultOpenTab({
                title: item.name,
                key: NEW_TAB_GEID,
                tplKey: item.geid,
                systemDefined: false,
                standard: item.standard,
              }),
            );
            dispatch(schemaTemplatesActions.setDefaultActiveKey(item.geid));
            dispatch(schemaTemplatesActions.switchTPLManagerMode('hide'));
          }
        }
      }
      if (templateManagerMode === 'update') {
        setUpdateConfirmationModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function getSchemaTPLAndInit(tplGeid) {
      const res = await getCustomSchemaTPLDetail(datasetGeid, tplGeid);
      setCurSchemaTPLContent(res?.data?.result.content);
      const mock = convertSchemaTPL2From(res?.data?.result);
      form.setFieldsValue(mock);
    }
    if (templateManagerMode === 'update') {
      if (selTPL) {
        getSchemaTPLAndInit(selTPL.geid);
      }
    }
  }, [selTPL, templateManagerMode]);
  function filterValueFromOldData(oldDataJSON, newSchemaTPL, oldSchemaTPL) {
    const oldKeys = Object.keys(oldDataJSON);
    const inValidKeys = [];
    for (let i = 0; i < oldKeys.length; i++) {
      const oldKey = oldKeys[i];
      const propertyDefineNew = newSchemaTPL.schema.properties[oldKey];
      const propertyDefineOld = oldSchemaTPL.schema.properties[oldKey];
      if (propertyDefineNew === 'undefined') {
        inValidKeys.push(oldKey);
        continue;
      }
      if (!_.isEqual(propertyDefineNew, propertyDefineOld)) {
        inValidKeys.push(oldKey);
        continue;
      }
    }
    return _.omit(oldDataJSON, inValidKeys);
  }
  const updateSchema = async () => {
    setUpdateLoading(true);
    const values = form.getFieldsValue();
    const schemaTPL = convertForm2SchemaTPL(_.cloneDeep(values.templateItems));
    if (datasetGeid && values.templateName && schemaTPL) {
      // create new template
      const newTPLRes = await createDatasetSchemaTPL(
        datasetGeid,
        values.templateName,
        schemaTPL,
        username,
      );
      const newTPL = newTPLRes.data.result;

      const oldSchema = schemas.find(
        (schema) => schema.tplGeid === selTPL.geid,
      );
      // map old value and create new draft
      const oldSchamaRes = await getSchemaDataDetail(
        datasetGeid,
        oldSchema.geid,
      );
      let draftCreated;
      if (oldSchamaRes?.data?.result?.content) {
        let oldDataJSON = oldSchamaRes?.data?.result?.content;
        let filterdDataJSON = filterValueFromOldData(
          oldDataJSON,
          schemaTPL,
          curSchemaTPLContent,
        );
        const newDraftName = values.templateName.toLowerCase() + '.schema.json';
        // create draft
        const draftCreatedRes = await createSchemaData(
          datasetGeid,
          false,
          'default',
          newDraftName,
          filterdDataJSON,
          newTPL.geid,
          username,
          true,
        );
        draftCreated = draftCreatedRes?.data?.result;
      }

      // delete old schema file
      if (oldSchema) {
        await deleteDatasetSchemaData(
          datasetGeid,
          oldSchema.geid,
          oldSchema.name,
        );
        //close old tab
        dispatch(
          schemaTemplatesActions.removeDefaultOpenTab(oldSchema.tplGeid),
        );
        await getDatasetSchemaList();
      }

      // open new tab
      if (newTPL) {
        dispatch(
          schemaTemplatesActions.addDefaultOpenTab({
            title: newTPL.name,
            key: draftCreated.geid,
            tplKey: newTPL.geid,
            systemDefined: false,
            standard: 'default',
          }),
        );
        dispatch(schemaTemplatesActions.setDefaultActiveKey(newTPL.geid));
      }
      dispatch(schemaTemplatesActions.switchTPLManagerMode('hide'));
    }
    setUpdateLoading(false);
    setUpdateConfirmationModal(false);

    await getSchemaTemplates();
  };

  const handleCancel = () => {
    setUpdateConfirmationModal(false);
  };
  return (
    <div className={styles.template_manager_section}>
      <div className={styles.template_manager_header}>
        <h3>Custom Schema Template</h3>
        <CloseOutlined
          onClick={() => {
            dispatch(schemaTemplatesActions.switchTPLManagerMode('hide'));
          }}
        />
      </div>
      <div className={`${styles.template_manager_actions}`}>
        <span className="template-bar-title">Edit Template</span>
        <Button
          onClick={() => {
            dispatch(schemaTemplatesActions.switchTPLManagerMode('hide'));
          }}
          className={`${
            templateManagerMode === 'update' ? 'update-mode' : 'create-mode'
          }`}
          type="link"
        >
          Cancel
        </Button>
      </div>
      <Form
        form={form}
        name="dynamic_form_nest_item"
        autoComplete="off"
        onFinish={onFinish}
        className={styles['form']}
      >
        <SchemaFormInternal
          templateManagerMode={templateManagerMode}
          form={form}
        />
        {templateManagerMode === 'create' ? (
          <Button
            loading={loading}
            className={styles['submit-button']}
            type="primary"
            icon={<SaveOutlined />}
            htmlType="submit"
          >
            Submit
          </Button>
        ) : (
          <Button
            loading={loading}
            className={styles['submit-button']}
            type="primary"
            icon={<PlusOutlined />}
            htmlType="submit"
          >
            Create New Template
          </Button>
        )}
      </Form>
      <Modal
        title="Confirmation"
        visible={updateConfirmationModal}
        onOk={updateSchema}
        confirmLoading={updateLoading}
        onCancel={handleCancel}
        bodyStyle={{ borderRadius: 10 }}
        wrapClassName={styles.confirm_modal}
      >
        <p>
          The schema [
          <b>{selTPL && selTPL.name.toLowerCase() + '.schema.json'}</b>] will be
          updated and mapped with this new schema template.
        </p>
      </Modal>
    </div>
  );
}
