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

import React, { useEffect, useState } from 'react';
import { Skeleton, Form, Tag, message } from 'antd';
import { CardExtra } from '../Components/CardExtra/CardExtra';
import { TagsInput } from '../Components/TagsInput/TagsInput';
import { DatasetCard as Card } from '../../Components/DatasetCard/DatasetCard';
import { validators } from '../../../DatasetLandingPage/Components/CreateDatasetPanel/createDatasetValidators';
import { useSelector } from 'react-redux';
export default function DatasetHomeTags(props) {
  const [form] = Form.useForm();
  const {
    loading,
    hasInit,
    basicInfo: { geid, tags },
  } = useSelector((state) => state.datasetInfo);

  useEffect(() => {
    if (hasInit) {
      form.setFieldsValue({ tags });
    }
  }, [hasInit, geid]);

  return (
    <Card title="Tags">
      <Skeleton loading={loading}>
        {' '}
        <Form form={form}>
          <Form.Item rules={validators.tags} name="tags">
            {tags?.map((tag) => (
              <Tag>{tag}</Tag>
            ))}
          </Form.Item>
        </Form>
      </Skeleton>
    </Card>
  );
}
