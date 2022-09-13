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

import React, { useState, useEffect } from "react";
import { Select, Form } from "antd";
import { withRouter } from "react-router-dom";
const leven = require("leven");
const { Option } = Select;

function FolderInput(props) {
  const [value, setValue] = useState("");
  const [basePath, setBasePath] = useState("");
  const [folders, setFolders] = useState([]);
  const [lastFolder, setLastFolder] = useState("");

  const handleSearch = (value) => {
    if (!value.length) return;
    const pathArr = value.split("/");
    if (pathArr[0] === "") {
      pathArr.shift();
    }
    const basePathArr = pathArr.slice(0, pathArr.length - 1);
    const newBasePath = "/" + basePathArr.join("/");
    const lastFolder = pathArr[pathArr.length - 1];
    if (newBasePath !== basePath) {
      setBasePath(newBasePath);
      const folders = getFoldersApi(newBasePath);
      setFolders(folders);
    }

    setLastFolder(lastFolder);
  };

  const getFoldersApi = (basePath) => {
    const {datasetId} = props.match.params;
    return ["", "a", "b", "c"];
  };

  const handleChange = (value) => {
    setValue(value);
    props.getFolderPath(value);
  };

  const generateOptions = (lastFolder) => {
    const sortedFolders = folders.sort((a, b) => {
      return leven(a, lastFolder) - leven(b, lastFolder);
    });

    return sortedFolders.map((item) => (
      <Option
        value={basePath + (basePath.length > 1 ? "/" : "") + item}
        key={basePath + (basePath.length > 1 ? "/" : "") + item}
      >
        {basePath + (basePath.length > 1 ? "/" : "") + item}
      </Option>
    ));
  };
  return (
    <Form.Item label="Folder">
      <Select
        style={{ width: "100%" }}
        onSearch={handleSearch}
        onChange={handleChange}
        showArrow={false}
        //defaultActiveFirstOption={false}
        placeholder={"type in path"}
        showSearch
        filterOption={false}
      >
        {generateOptions(lastFolder)}
        {/* {folders.map(item=>(<Option key={item}>{item}</Option>)) */}
      </Select>
    </Form.Item>
  );
}

export default withRouter(FolderInput);
