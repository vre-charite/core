import React from 'react';

import FileStatModal from './Modals/FileStatModal';

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
  title: 'General Statistics',
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
  title: 'File Statistics',
  content: 'hello',
  defaultSize: 'm',
  expandable: false,
  exportable: false,
};

const cardsAttr = {
  initial: [],
  //  vre cards
  admin: [info, fileStats, files, userStats],

  uploader: [
    info,
    {
      ...userStats,
      title: 'Contributor Statistics',
    },
    files,
  ],
  contributor: [
    info,
    {
      ...userStats,
      title: 'Contributor Statistics',
    },
    files,
  ],
  collaborator: [
    info,
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
