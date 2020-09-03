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
