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

import React, { useState, useEffect } from 'react';
import { Input, Button, Select, Form, DatePicker } from 'antd';
import moment from 'moment-timezone';
const Option = Select.Option;
const { RangePicker } = DatePicker;

const dateFormat = 'YYYY-MM-DD';
const timeConvert = (timeStamp) => {
  return moment(timeStamp * 1000).format(dateFormat);
}
const defaultTimeRange = (condition) => {
  if (condition.category === 'time_created' && condition.calendar) {
    return [moment(timeConvert(condition.calendar[0]), dateFormat), moment(timeConvert(condition.calendar[1]), dateFormat)]
  } else {
    return ''
  }
}

const disabledDate = (current) => {
  return current && current >= moment().endOf('day');
};

function UploadTimeCondition({
  condition,
  updateCondition,
  clearTrigger,
  form,
}) {
  useEffect(() => {
    if (clearTrigger) {
      form.resetFields(['CalendarValues']);
    }
  }, [clearTrigger]);
  return (
    <>
      <Form.Item label="Condition" style={{ width: '200px', marginRight: 18 }}>
        <Select defaultValue="between" disabled showArrow={false}>
          <Option value="between">Between</Option>
        </Select>
      </Form.Item>
      <Form.Item
        label="Calendar"
        name="CalendarValues"
        initialValue={defaultTimeRange(condition)}
        rules={[
          {
            required: true,
          },
        ]}
        style={{ flex: 1, display: 'inline-block' }}
      >
        <RangePicker
          style={{ width: '100%', borderRadius: '6px' }}
          disabledDate={disabledDate}
          onChange={(time, timeString) => {
            if (time) {
              const timeRange = [
                time[0].startOf('day').unix(),
                time[1].endOf('day').unix(),
              ];
              updateCondition(condition.cid, {
                calendar: timeRange,
              });
            } else {
              updateCondition(condition.cid, {
                calendar: '',
              });
            }
          }}
        />
      </Form.Item>
    </>
  );
}

export default UploadTimeCondition;
