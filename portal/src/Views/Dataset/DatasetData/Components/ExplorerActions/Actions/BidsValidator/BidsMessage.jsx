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
import { Divider } from 'antd';
import { CloseOutlined, } from '@ant-design/icons';

export default function BidsMessage(props) {
    return (
        <div style={{ width: 700, height: 600 }}>
            <div style={{ margin: '5px 20px 0px 20px',}}>
                <h4 >Bids Validation</h4>
                <CloseOutlined 
                    style={{ float: 'right', marginTop: -25 }}
                    onClick={() => console.log('close')}
                />
            </div>
            <Divider style={{ marginTop: 0 }} />
        </div>
    );
}