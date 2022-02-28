import React, { useState, useEffect } from 'react';
import styles from './SchemaForm.module.scss';
import Form from '@rjsf/antd';
import { Button, message, Divider } from 'antd';
import { SaveOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import DisplayForm from './DisplayForm';
import {
  NEW_TAB_GEID,
  ESSENTIAL_SCHEMA_NAME,
  ESSENTIAL_TPL_NAME,
} from '../../GlobalDefinition';
import { useSelector, useDispatch } from 'react-redux';
import {
  datasetInfoCreators,
  schemaTemplatesActions,
} from '../../../../../Redux/actions';
import {
  getDefaultSchemaTPLDetail,
  getSchemaDataDetail,
  updateDatasetSchemaDataApi,
  createSchemaData,
  getDatasetSchemaListAPI,
  getDatasetByDatasetCode,
  getCustomSchemaTPLDetail,
} from '../../../../../APIs';
import { getFormUpdateActivityLog } from './getActivitylog';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { trimString } from '../../../../../Utility';
import CustomSelectWidget from './CustomWidgets/CustomSelectWidget';
import CustomDateWidget from './CustomWidgets/CustomDateWidget';
import CustomTextWidget from './CustomWidgets/CustomTextWidget';
const FORM_MODE = {
  DISPLAY: 'DISPLAY',
  EDIT_EMPTY_DRAFT: 'EDIT_EMPTY_DRAFT',
  EDIT_COMPLETED: 'EDIT_COMPLETED',
};
export default function SchemaForm({ pane }) {
  const [mode, setMode] = useState(null);
  const schemas = useSelector((state) => state.schemaTemplatesInfo.schemas);
  const datasetInfo = useSelector((state) => state.datasetInfo.basicInfo);
  const { username } = useSelector((state) => state);
  const datasetGeid = datasetInfo.geid;
  const [schemaSel, setSchemaSel] = useState(null);
  const [formData, setFormData] = useState({});
  const [formDataOriginal, setFormDataOriginal] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const [saveLoading, setSaveLoading] = useState(false);
  const [draftSaveLoading, setDraftSaveLoading] = useState(false);
  const [isDraftEditing, setIsDraftEditing] = useState(false);
  const { datasetCode } = useParams();
  const [extraErrors, setExtraErrors] = useState({});
  const { t } = useTranslation(['errormessages']);
  const getDatasetSchemaList = async () => {
    try {
      const res = await getDatasetSchemaListAPI(datasetInfo.geid);
      dispatch(schemaTemplatesActions.updateDefaultSchemaList(res.data.result));
    } catch (error) {
      console.log(error);
    }
  };
  const widgets = {
    SelectWidget: CustomSelectWidget,
    DateWidget: CustomDateWidget,
    TextWidget: CustomTextWidget,
  };
  const replaceCurPaneWithCreatedSchema = (schemaCreated) => {
    dispatch(
      schemaTemplatesActions.updateDefaultOpenTab({
        target: pane.tplKey,
        params: {
          title: schemaCreated.isDraft
            ? `${schemaSel.name} / Draft`
            : schemaSel.name,
          key: schemaCreated.geid,
          tplKey: schemaCreated.tplGeid,
          systemDefined: schemaCreated.systemDefined,
          standard: schemaCreated.standard,
        },
      }),
    );
    dispatch(schemaTemplatesActions.setDefaultActiveKey(schemaCreated.tplGeid));
  };

  const updateSchema = async (isDraft) => {
    const schemaName = schemaSel.name.toLowerCase() + '.schema.json';
    try {
      const activeLog = getFormUpdateActivityLog(
        _.cloneDeep(formDataOriginal),
        _.cloneDeep(formData),
        schemaName,
        schemaSel.content.schema.properties,
      );
      const res = await updateDatasetSchemaDataApi(
        datasetGeid,
        pane.key,
        schemaName,
        isDraft,
        formData,
        activeLog,
      );
      if (res.data.result) {
        return res.data.result;
      }
    } catch (e) {
      message.error(`${t('errormessages:updateDatasetSchema.default.0')}`);
    }
  };
  const createNewSchema = async (isDraft) => {
    const schemaName = schemaSel.name.toLowerCase() + '.schema.json';
    try {
      const res = await createSchemaData(
        datasetGeid,
        pane.systemDefined,
        pane.standard,
        schemaName,
        formData,
        schemaSel.geid,
        username,
        isDraft,
      );
      if (res.data.result) {
        return res.data.result;
      }
    } catch (e) {
      message.error(`${t('errormessages:createDatasetSchema.default.0')}`);
    }
  };
  const saveFormData = async () => {
    setSaveLoading(true);
    let newSchemaObj;
    if (isDraftEditing) {
      newSchemaObj = await updateSchema(false);
    } else {
      newSchemaObj = await createNewSchema(false);
    }
    if (newSchemaObj) {
      await getDatasetSchemaList();
      replaceCurPaneWithCreatedSchema(newSchemaObj);
    }

    setMode(FORM_MODE.DISPLAY);
    setSaveLoading(false);
  };
  const saveDraft = async () => {
    if (Object.keys(formData).length === 0) {
      message.error(`${t('errormessages:createDatasetSchemaDraft.empty.0')}`);
      return;
    }
    setDraftSaveLoading(true);
    let newSchemaObj;
    if (isDraftEditing) {
      newSchemaObj = await updateSchema(true);
    } else {
      newSchemaObj = await createNewSchema(true);
    }
    if (newSchemaObj) {
      await getDatasetSchemaList();
      replaceCurPaneWithCreatedSchema(newSchemaObj);
    }
    setDraftSaveLoading(false);
  };
  function onClear() {
    setFormData(formDataOriginal);
  }
  const transformErrors = (errors) => {
    return errors.map((error) => {
      if (
        error.property === '.dataset_description' &&
        error.message === 'is a required property'
      ) {
        error.message = 'This field is required';
      }
      if (error.message === 'should NOT have fewer than 1 items') {
        error.message = 'Please add at least 1 item';
      }
      if (error.message === 'should be string') {
        error.message = 'Please enter a string';
      }

      return error;
    });
  };
  useEffect(() => {
    async function initSchemaTPL(tplGeid) {
      let res;
      if (pane.systemDefined) {
        res = await getDefaultSchemaTPLDetail(tplGeid);
      } else {
        res = await getCustomSchemaTPLDetail(datasetGeid, tplGeid);
      }

      if (res?.data?.result?.content) {
        const schemaTPLRes = res?.data?.result;
        setSchemaSel(schemaTPLRes);
      }
    }
    async function initFormData(schemaDataGeid) {
      const res = await getSchemaDataDetail(datasetGeid, schemaDataGeid);
      if (res?.data?.result?.content) {
        const schemaDataJSON = res?.data?.result?.content;
        if (res?.data?.result?.name === ESSENTIAL_SCHEMA_NAME) {
          schemaDataJSON['dataset_code'] = datasetInfo.code;
        }
        setFormData(schemaDataJSON);
        setFormDataOriginal(schemaDataJSON);
      }
      setIsDraftEditing(res?.data?.result?.is_draft);
    }
    if (pane.tplKey) {
      initSchemaTPL(pane.tplKey);
      if (pane.key && pane.key !== NEW_TAB_GEID) {
        initFormData(pane.key);
      } else {
        setIsDraftEditing(false);
      }
    }
    const filledSchema = schemas.find((s) => s.geid === pane.key);
    if (pane.key === NEW_TAB_GEID || (filledSchema && filledSchema.isDraft)) {
      setMode(FORM_MODE.EDIT_EMPTY_DRAFT);
    } else {
      setMode(FORM_MODE.DISPLAY);
    }
  }, [pane, datasetGeid]);

  const onSubmit = async (formData2Validate) => {
    const extraErrorList = validateExtra(formData2Validate);
    if (extraErrorList && Object.keys(extraErrorList).length) {
      return;
    }
    setSubmitting(true);
    try {
      const schemaName = schemaSel.name.toLowerCase() + '.schema.json';
      const activityLog = getFormUpdateActivityLog(
        formDataOriginal,
        formData,
        schemaName,
        schemaSel.content.schema.properties,
      );
      if (activityLog[0]?.detail?.targets?.length === 0) {
        message.info('The form has no change');
      } else {
        const res = await updateDatasetSchemaDataApi(
          datasetGeid,
          pane.key,
          schemaName,
          false,
          formData,
          activityLog,
        );
        setFormDataOriginal(formData);
        setMode(FORM_MODE.DISPLAY);
        if (schemaSel.name === ESSENTIAL_TPL_NAME) {
          getDatasetByDatasetCode(datasetCode)
            .then((res) => {
              const {
                data: { result: basicInfo },
              } = res;
              dispatch(datasetInfoCreators.setBasicInfo(basicInfo));
            })
            .catch((err) => {
              message.error(t('errormessages:getDatasetInfo.default.0'));
            });
        }
      }
    } catch (error) {
      message.error(t('errormessages:updateDatasetSchema.default.0'));
    } finally {
      setSubmitting(false);
    }
  };

  if (pane.key === NEW_TAB_GEID && !pane.tplKey) return null;
  if (!schemaSel || !schemaSel.content) return null;
  const validateExtra = (formData2Validate) => {
    if (schemaSel.name !== ESSENTIAL_TPL_NAME) {
      return;
    }
    const errorObj = {};
    if (
      formData2Validate.dataset_tags.find((tag) => tag && tag.includes(' '))
    ) {
      errorObj['dataset_tags'] = {
        __errors: [
          `${t('errormessages:validateEssentialSchema.tags.noWhiteSpace')}`,
        ],
      };
    }
    if (
      formData2Validate.dataset_description &&
      trimString(formData2Validate.dataset_description).length === 0
    ) {
      errorObj['dataset_description'] = {
        __errors: [
          `${t(
            'errormessages:validateEssentialSchema.description.onlyWhiteSpace',
          )}`,
          ,
        ],
      };
    }
    setExtraErrors(errorObj);
    return errorObj;
  };
  return (
    mode && (
      <div className={styles.schema_form}>
        {mode === FORM_MODE.DISPLAY && (
          <>
            {pane ? (
              <>
                <div className={styles.display_icon_bar}>
                  <Button
                    type="link"
                    onClick={() => {
                      setMode(FORM_MODE.EDIT_COMPLETED);
                      setExtraErrors({});
                    }}
                    icon={<EditOutlined />}
                  >
                    Edit
                  </Button>
                  {!pane.systemDefined ? (
                    <Button
                      type="link"
                      onClick={() => {
                        dispatch(
                          schemaTemplatesActions.switchTPLManagerMode('update'),
                        );
                      }}
                      icon={<EditOutlined />}
                    >
                      Manage Template
                    </Button>
                  ) : null}
                </div>
                <Divider style={{ margin: '5px 0px 15px 0px' }} />
              </>
            ) : null}
            <div className={styles.display_form_wrapper}>
              <DisplayForm
                schemaTPL={schemaSel.content.schema}
                uiSchema={schemaSel.content.ui}
                formData={formDataOriginal}
                xpath={''}
              />
            </div>
          </>
        )}
        {mode === FORM_MODE.EDIT_COMPLETED && (
          <>
            <div className={styles.update_icon_bar}>
              <Button icon={<CloseOutlined />} onClick={onClear} type="link">
                Reset
              </Button>
              <Button
                type="link"
                onClick={() => {
                  setMode(FORM_MODE.DISPLAY);
                  onClear();
                }}
              >
                Cancel
              </Button>
            </div>
            <Divider style={{ margin: '5px 0px 15px 0px' }} />
            <Form
              className={styles.form}
              liveValidate
              schema={schemaSel.content.schema}
              uiSchema={schemaSel.content.ui}
              widgets={widgets}
              formData={formData}
              onSubmit={(e) => {
                onSubmit(e.formData);
              }}
              onChange={(e) => {
                setFormData(e.formData);
                validateExtra(e.formData);
              }}
              extraErrors={extraErrors}
              transformErrors={transformErrors}
            >
              <Button loading={submitting} type="primary" htmlType="submit">
                Update
              </Button>
            </Form>
          </>
        )}
        {mode === FORM_MODE.EDIT_EMPTY_DRAFT && (
          <>
            <div className={styles.draft_icon_bar}>
              <Button
                type="link"
                icon={<SaveOutlined />}
                onClick={saveDraft}
                disabled={saveLoading}
                loading={draftSaveLoading}
              >
                Save as draft
              </Button>
              <Button icon={<CloseOutlined />} onClick={onClear} type="link">
                Reset
              </Button>
            </div>
            <Divider style={{ margin: '5px 0px 15px 0px' }} />
            <Form
              className={styles.form}
              schema={schemaSel.content.schema}
              uiSchema={schemaSel.content.ui}
              widgets={widgets}
              disabled={draftSaveLoading}
              formData={formData}
              onChange={(e) => setFormData(e.formData)}
              onSubmit={saveFormData}
              transformErrors={transformErrors}
            >
              <Button loading={saveLoading} type="primary" htmlType="submit">
                Submit
              </Button>
            </Form>
          </>
        )}
      </div>
    )
  );
}
