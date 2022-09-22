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

import React, { Component } from 'react';
import { Card, Button, Row, Col } from 'antd';
import styles from './index.module.scss';
import {
  FullscreenOutlined,
  DownloadOutlined,
  DragOutlined,
  SearchOutlined,
} from '@ant-design/icons';

export default class BasicCard extends Component {
  state = {
    export: false,
  };

  onExportClick = () => {
    this.setState({ export: !this.state.export });
  };

  onExpandClick = () => {
    const { handleExpand, content, title } = this.props;

    let modalContent = content('l', this.state.export, this.onExportClick);

    handleExpand(modalContent, title, '95vw');
  };

  render() {
    const { exportable, expandable, content, title, defaultSize } = this.props;
    const cardTitle = <span className={styles.cardTitle}>{title}</span>;
    const fileStreamTitle = (
      <div>
        <span className={styles.fileStreamTitle}>{title}</span>
        <span style={{ margin: '0 26px', color: '#595959' }}>|</span>
        <div
          style={{ display: 'inline-block', cursor: 'pointer' }}
          onClick={(e) => {
            if (content.props && content.props.onExpand) {
              content.props.onExpand();
            }
          }}
        >
          <SearchOutlined style={{ color: '#595959' }} />
          <span style={{ marginLeft: '10px', color: '#595959' }}>
            Advanced Search
          </span>
        </div>
      </div>
    );
    return (
      <Card
        className={styles.basic}
        title={
          title === 'Recent File Stream' ||
          title === 'Contributor Statistics' ||
          title === 'Collaborator Statistics'
            ? fileStreamTitle
            : cardTitle
        }
        size="small"
        bordered="false"
        extra={
          <div>
            {expandable && (
              <Button type="link" onClick={this.onExpandClick}>
                <FullscreenOutlined style={{ position: 'static' }} />
              </Button>
            )}
            {exportable && (
              <Button type="link" onClick={this.onExportClick}>
                <DownloadOutlined style={{ position: 'static' }} />
              </Button>
            )}
            <Button
              type="link"
              className="dragarea"
              style={{ paddingRight: '0', paddingLeft: '0' }}
            >
              <DragOutlined style={{ position: 'static', fontSize: '15px' }} />
            </Button>
          </div>
        }
      >
        {exportable
          ? content(defaultSize, this.state.export, this.onExportClick)
          : expandable
          ? typeof content === 'function' && content(defaultSize)
          : content}
      </Card>
    );
  }
}
