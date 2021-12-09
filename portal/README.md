# VRE Portal

## Getting Started

### Frontend

This is the front end react application of Indoc VRE project. The back end is on server `http://10.3.9.241:8000`. The project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). The back end is on `./server` folder.

#### Prerequisites

+ nodejs: ^12.16.3
+ npm: ^6.14.4

install both npm and nodejs on `https://nodejs.org/en/`

#### Pull the Repo

open a terminal, execute `git clone git@git.indocresearch.org:charite/core.git&&cd ./Core/portal`.

#### Install dependencies

run `npm i` on the `ROOT/portal` folder to install all the dependencies.

#### Run the Application

run `npm start` to start the React application. You can access the webpage on `localhost:3000` after it starts.

#### Build a Production Version

run `npm build`. After the compilation completed, the minimized static files are in `./build`. You can use any other backend to serve these files.

#### Eject

Since the webpack tool configs are hidden in this version of Create-React-App, you can run `npm eject` to get access to all these config files.  
**Note: this is a one-way operation. Once you `eject`, you can’t go back!**


***

### Backend

#### Prerequisites

- Python 3.7.3
- You can find all prerequisites in  [requirements.txt](https://us04web.zoom.us/j/79599480191?pwd=T2JGZ25uQmVoZklhWHRrRzhCVVVzdz09), install all by `pip install -r requirements.txt`



####  Start server on local

- Fulfill all prerequisites and go to `/portal/server`

```bash
$ python app.py
```

- The server will run on port 5060



#### Connect remote server

- The backend server is protected by KONG API gateway
- Base URL: http://10.3.9.241:8000/vre/portal/

- The backend server also communicates with three services:
  - [Neo4j Service](https://git.indocresearch.org/platform/dataset_neo4j)
  - [User Management Service](https://git.indocresearch.org/platform/service_user_management)
  - [Data Operation Service](https://git.indocresearch.org/platform/service_data_operation)



#### Running the tests

- Go to the folder `/portal/server/test`, all backend unit test will be placed here
- You can simply run each unit test with `python <unit-test-file>`









