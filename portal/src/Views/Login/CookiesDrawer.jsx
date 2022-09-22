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
