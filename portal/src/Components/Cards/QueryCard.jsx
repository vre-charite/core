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

import React, { Component } from "react";
import { Layout } from "antd";
import styles from "./index.module.scss";

const { Sider } = Layout;

export default class QueryCard extends Component {
    render() {
        const { collapsed, content } = this.props;

        return (
            <Sider
                trigger={null}
                collapsed={collapsed}
                collapsedWidth="0"
                zeroWidthTriggerStyle={{
                    backgroundColor: "white",
                    right: "-23px"
                }}
                className={styles.sider}
                width={400}
                theme="light"
            >
                {content ? content : this.props.children}
            </Sider>
        );
    }
}
