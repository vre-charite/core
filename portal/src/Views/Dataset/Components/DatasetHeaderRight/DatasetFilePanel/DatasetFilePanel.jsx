import React from 'react';
import { Badge } from 'antd';
import Icon from '@ant-design/icons';

const DatasetFilePanel = () => {
    return (
      <Badge>
        <Icon
          component={() => (
            <img
              className="pic"
              src={require('../../../../../Images/FilePanel.png')}
            />
          )}
        />
      </Badge>
    );
};

export default DatasetFilePanel;