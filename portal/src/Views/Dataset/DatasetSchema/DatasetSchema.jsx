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

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { message } from 'antd';
import styles from './DatasetSchema.module.scss';
import DatasetSchemaExisting from './DatasetSchemaExisting/DatasetSchemaExisting';
import DatasetSchemaTemplates from './DatasetSchemaTemplates/DatasetSchemaTemplates';
import { schemaTemplatesActions } from '../../../Redux/actions';
import {
  getDatasetSchemaListAPI,
  getDatasetDefaultSchemaTemplateListAPI,
  getDatasetCustomSchemaTemplateListAPI,
} from '../../../APIs/index';
import { ESSENTIAL_TPL_NAME } from './GlobalDefinition';
import { useTranslation } from 'react-i18next';

export default function DatasetData(props) {
  const datasetInfo = useSelector((state) => state.datasetInfo.basicInfo);
  const dispatch = useDispatch();
  const { t } = useTranslation(['errormessages', 'success']);

  // get datasetSchemaList
  const getDatasetSchemaList = async () => {
    try {
      const res = await getDatasetSchemaListAPI(datasetInfo.geid);
      dispatch(schemaTemplatesActions.updateDefaultSchemaList(res.data.result));
      return res.data.result;
    } catch (error) {
      message.error(t('errormessages:datasetSchemaList.default.0'));
    }
  };

  // get dataset schema templates list
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

  useEffect(() => {
    async function initData() {
      dispatch(schemaTemplatesActions.setSchemaTypes('Default'));
      dispatch(schemaTemplatesActions.clearDefaultOpenTab());
      const schemasTemplates = await getSchemaTemplates();
      const schemas = await getDatasetSchemaList();
      const essentialTpl = schemasTemplates.find(
        (el) => el.name === ESSENTIAL_TPL_NAME,
      );
      const essentialSchema = schemas.find(
        (el) => el.tplGeid === essentialTpl.geid,
      );
      if (essentialSchema) {
        dispatch(
          schemaTemplatesActions.addDefaultOpenTab({
            title: essentialTpl.name,
            key: essentialSchema.geid,
            tplKey: essentialSchema.tplGeid,
            systemDefined: essentialSchema.systemDefined,
            standard: essentialSchema.standard,
          }),
        );
        dispatch(
          schemaTemplatesActions.setDefaultActiveKey(essentialSchema.tplGeid),
        );
      }
    }
    if (datasetInfo.geid) {
      initData();
    }
  }, [datasetInfo.geid]);

  return (
    <div className={styles['container']}>
      <div className={styles['existing-schema']}>
        <DatasetSchemaExisting />
      </div>
      <div className={styles['blank-templates']}>
        <DatasetSchemaTemplates />
      </div>
    </div>
  );
}
