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


const info = {
  type: 'info',
  key: '0',
  title: 'Project Information',
  content:
    'stands for GErman NEtwork for Research on AuToimmune Encephalitis. Our mission is to address the medical community working on autoimmuneencephalitis as well as all patients and their relatives touched by this condition.',
  expandable: false,
  exportable: false,
};

const fileStats = {
  type: 'fileStats',
  key: '2',
  title: 'File Statistics',
  defaultSize: 'm',
  expandable: false,
  exportable: false,
};

const files = {
  type: 'files',
  key: '1',
  title: 'File Explorer',
  defaultSize: 'm',
  expandable: true,
  exportable: false,
};

const userStats = {
  type: 'userStats',
  key: '3',
  title: 'Recent File Stream',
  content: 'hello',
  defaultSize: 'm',
  expandable: false,
  exportable: false,
};

const superset = {
  type:'superset',
  key:'4',
  title:"Superset",
  defaultSize: 'm',
  expandable: false,
  exportable: false,
}

const cardsAttr = {
  initial: [],
  //admin: [info, fileStats, files, userStats,superset],
  admin: [fileStats, files, userStats],
  contributor: [
    fileStats,
    {
      ...userStats,
      title: 'Contributor Statistics',
    },
    files,
  ],
  collaborator: [
    fileStats,
    {
      ...userStats,
      title: 'Collaborator Statistics',
    },
    files,
  ],
  member: [
    info,
    {
      ...userStats,
      title: 'Contributor Statistics',
    },
    files,
  ],
};

export default cardsAttr;
