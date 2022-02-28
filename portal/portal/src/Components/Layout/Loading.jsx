import React from 'react';
import { Spin } from 'antd';
function Loading() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Spin
        style={{
          position: 'absolute',
          top: '50%',
          left: ' 50%',
          transform: 'translate(-50%, -50%)',
        }}
        tip="Loading..."
      ></Spin>
    </div>
  );
}

export { Loading };
