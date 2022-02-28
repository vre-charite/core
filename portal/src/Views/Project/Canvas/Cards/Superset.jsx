import React from 'react';
import { DOMAIN_DEV } from '../../../../config';
const src =
  (process.env.NODE_ENV === 'development' ? `http://${DOMAIN_DEV}` : '') +
  '/bi/superset/welcome';

function Superset() {
  return (
    <div>
      <iframe width="100%" height="870px" title="superset" src={src}></iframe>
    </div>
  );
}

export default Superset;
