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

import React, { useState } from 'react';
import { Button } from 'antd';
import { PullRequestOutlined } from '@ant-design/icons';
import RequestToCoreModal from './RequestToCoreModal';

const RequestToCorePlugin = (props) => {
  const [showModal, setShowModal] = useState(false);
  const [sourcePath, setSourcePath] = useState('');
  const { selectedRows, currentRouting, orderRouting } = props;
  const handleOnClick = () => {
    const filePath = selectedRows[0].displayPath.replace(
      `/${selectedRows[0].fileName}`,
      '',
    );
    setSourcePath(`${filePath}`);
    setShowModal(true);
  };
  return (
    <>
      <Button
        type="link"
        icon={<PullRequestOutlined />}
        style={{ marginRight: 8 }}
        onClick={handleOnClick}
      >
        Request to Core
      </Button>
      <RequestToCoreModal
        showModal={showModal}
        setShowModal={setShowModal}
        selectedRows={selectedRows}
        sourcePath={sourcePath}
        currentRouting={currentRouting}
        orderRouting={orderRouting}
      />
    </>
  );
};

export default RequestToCorePlugin;
