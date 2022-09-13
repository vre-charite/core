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

import React from 'react';
import { Checkbox } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';

export const selectionOptions = {
  renderCell: function (checked, record, index, originNode) {
    const { reviewStatus } = record;
    if (record.archived) {
      return <Checkbox disabled />;
    }
    if (reviewStatus === 'approved') {
      return <CheckOutlined style={{ color: '#5b8c00' }} />;
    }
    if (reviewStatus === 'denied') {
      return <CloseOutlined style={{ color: '#ff6d72' }} />;
    }

    return originNode;
  },
  getCheckboxProps: function (record) {
    if (
      record.archived ||
      record.reviewStatus === 'approved' ||
      record.reviewStatus === 'denied'
    ) {
      return {
        disabled: true,
      };
    }
  },
};
