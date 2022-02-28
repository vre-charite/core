import React from 'react';
import { Drawer, Checkbox, Button } from 'antd';

const CookiesDrawer = ({ onDrawerClose, cookiesDrawer }) => {
  return (
    <Drawer
      title="Cookies on this site"
      placement="right"
      closable={false}
      onClose={onDrawerClose}
      visible={cookiesDrawer}
    >
      <p>
        We use <strong>following strictly necessary cookies</strong> to fulfil
        the site functionality. These are not tracking cookies.
      </p>
      <p>
        <strong>Access token</strong> : An encoded token that is used to mark
        user's identity and access to services.
      </p>
      <p>
        <strong>Refresh token</strong>: An encoded token that is used to refresh
        user's session.
      </p>
      <p>
        <strong>Username</strong> : Username of the current user.
      </p>
      <p>
        <strong>Login status</strong> : A boolean that marks whether a user is
        logged in.
      </p>
      <p>
        <strong>Cookies notification</strong> : A boolean that marks whether a
        user has seen the cookies notification.
      </p>
      <br />
      <p>Explainations about other cookies, if any.</p>
      <p>The site is currently using following cookies:</p>
      <Checkbox checked={true} disabled={true}>
        Strictly necessary cookies
      </Checkbox>
      <br />
      <br />
      <Button onClick={onDrawerClose} type="primary" size="small">
        OK
      </Button>
    </Drawer>
  );
};

export default CookiesDrawer;
