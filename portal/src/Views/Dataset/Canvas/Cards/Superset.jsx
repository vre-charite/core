import React from 'react';
const src =
  (process.env.NODE_ENV === 'development' ? 'http://10.3.7.220' : '') +
  '/bi/superset/welcome';

function Superset() {
  return (
    <div>
      <iframe width="100%" height="870px" title="superset" src={src}></iframe>
    </div>
  );
}

export default Superset;
