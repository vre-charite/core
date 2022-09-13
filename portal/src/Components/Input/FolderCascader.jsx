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

import React, { useState } from "react";
import { Cascader,Form } from "antd";

function FolderCascader(props) {
  const defaultOptions = [
    {
      value: "zhejiang",
      label: "folder1",
      isLeaf: false,
    },
    {
      value: "jiangsu",
      label: "folder2",
      isLeaf: false,
    },
  ];

  const [options, setOptions] = useState(defaultOptions);

  const loadData = (selectedOptions) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;

    // load options lazily
    setTimeout(() => {
      targetOption.loading = false;
      targetOption.children = [
        {
          label: `${targetOption.label} Dynamic 1`,
          value: "dynamic1",
        },
        {
          label: `${targetOption.label} Dynamic 2`,
          value: "dynamic2",
        },
      ];
      setOptions([...options]);
    }, 1000);
  };

  const onChange = (value, selectedOptions) => {
    console.log(value, selectedOptions);
  };

  return (
    <Form.Item label="Folder">
      <Cascader
        options={options}
        loadData={loadData}
        onChange={onChange}
        changeOnSelect
      />
    </Form.Item>
  );
}

export default FolderCascader;
