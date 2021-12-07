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
