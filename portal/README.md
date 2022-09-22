<!--
 Copyright 2022 Indoc Research
 
 Licensed under the EUPL, Version 1.2 or – as soon they
 will be approved by the European Commission - subsequent
 versions of the EUPL (the "Licence");
 You may not use this work except in compliance with the
 Licence.
 You may obtain a copy of the Licence at:
 
 https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 
 Unless required by applicable law or agreed to in
 writing, software distributed under the Licence is
 distributed on an "AS IS" basis,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 express or implied.
 See the Licence for the specific language governing
 permissions and limitations under the Licence.
 
-->

# Pilot Portal

## Getting Started

### Frontend

This is the front end react application of Indoc Pilot project. The back end is on server `http://10.3.9.241:8000`. The project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). The back end is on `./server` folder.

#### Prerequisites

- nodejs: ^12.16.3
- npm: ^6.14.4

install both npm and nodejs on `https://nodejs.org/en/`

#### Install dependencies

run `npm i` on the `ROOT/portal` folder to install all the dependencies.

#### Config .env file

| Parameter                            | Description                                                                             | Default      |
| ------------------------------------ | --------------------------------------------------------------------------------------- | ------------ |
| REACT_APP_PORTAL_PATH                | root path for portal. you also need to update "homepage" in package.json to take effect | /pilot       |
| REACT_APP_BRANDING_PATH              | page path for your own branding page. logout/login/session expired                      | /pilot/login |
| REACT_APP_API_PATH                   | backend api endpoint for bff                                                            |
| REACT_APP_UPLOAD_URL                 | backend api endpoint for upload service                                                 |
| REACT_APP_DOWNLOAD_URL               | backend api endpoint for download service                                               |
| REACT_APP_DOWNLOAD_URL_V1            | backend api endpoint for download service v1                                            |
| REACT_APP_DEFAULT_AUTH_URL           | url for keycloak auth                                                                   |
| REACT_APP_KEYCLOAK_REALM             | keycloak realm                                                                          |
| REACT_APP_PLATFORM                   | Platform Name                                                                           | Pilot        |
| REACT_APP_DOMAIN_DEV                 | dev server domain                                                                       |
| REACT_APP_DOMAIN_STAGING             | staging server domain                                                                   |
| REACT_APP_DOMAIN_PROD                | prod server domain                                                                      |
| REACT_APP_SUPPORT_EMAIL              | user support email address                                                              |
| REACT_APP_PROXY_ROUTE                | proxy bff route when you are on local developing                                        |
| REACT_APP_XWIKI                      | xwiki path for all document                                                             |
| REACT_APP_ORGANIZATION_PORTAL_DOMAIN | your organization domain                                                                |
| REACT_APP_TEST_ENV                   | env for test cases, do not change this                                                  | dev          |
| REACT_APP_DcmSpaceID                 | DCM ID Title                                                                            | Dcm ID       |
| REACT_APP_dcmProjectCode             | Project used DCM ID                                                                     |

#### Run the Application

run `npm start` to start the React application. You can access the webpage on `localhost:3000` after it starts.

#### Build a Production Version

run `npm build`. After the compilation completed, the minimized static files are in `./build`. You can use any other backend to serve these files.

#### Terms of Use

The terms of use is in `public/files/terms-of-use.html`

---

### Backend

#### Prerequisites

- Python 3.7.3
- You can find all prerequisites in [requirements.txt](https://us04web.zoom.us/j/79599480191?pwd=T2JGZ25uQmVoZklhWHRrRzhCVVVzdz09), install all by `pip install -r requirements.txt`

#### Start server on local

- Fulfill all prerequisites and go to `/portal/server`

```bash
$ python app.py
```

- The server will run on port 5060

#### Running the tests

- Go to the folder `/portal/server/test`, all backend unit test will be placed here
- You can simply run each unit test with `python <unit-test-file>`

