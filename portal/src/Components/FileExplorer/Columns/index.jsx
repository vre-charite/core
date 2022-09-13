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
import { PluginColumnComponents } from '../Plugins';
import CreatedTimeDefault from './CreatedTime/CreatedTimeDefault';
import FileNameDefault from './FileName/FileNameDefault';
import LabelDefault from './Label/LabelDefult';
import OwnerDefault from './Owner/OwnerDefult';
import SizeDefault from './Size/SizeDefult';
import DcmIDDefault from './DcmID/DcmIDDefault';
import ReviewedByDefault from './ReviewedBy/ReviewedByDefault';
import ReviewedAtDefault from './ReviewedAt/ReviewedAtDefault';
import Action from './Action/Action';
export const ColumnDefaultComponents = {
  CreatedTimeDefault: CreatedTimeDefault,
  FileNameDefault: FileNameDefault,
  LabelDefault: LabelDefault,
  OwnerDefault: OwnerDefault,
  SizeDefault: SizeDefault,
  DcmIDDefault: DcmIDDefault,
  ReviewedAtDefault: ReviewedAtDefault,
  ReviewedByDefault: ReviewedByDefault,
};
export const COLUMN_COMP_IDS = {
  ...ColumnDefaultComponents,
  ...PluginColumnComponents,
};

export const DEFAULT_COLUMN_COMP_MAP = {
  createTime: 'CreatedTimeDefault',
  fileName: 'FileNameDefault',
  label: 'LabelDefault',
  owner: 'OwnerDefault',
  fileSize: 'SizeDefault',
  dcmId: 'DcmIDDefault',
  reviewedAt: 'ReviewedAtDefault',
  reviewedBy: 'ReviewedByDefault',
};

export function getColumnsResponsive() {}

/*
 * Calculate the columns array for antd table
 * @columns: array of reserved column name.  eg. ['label', 'fileName', 'owner', 'createTime', 'size'];
 * @columnsLayout: function to calculate the width of each columns (isSidePanelOpen:boolean) => {}
 * @columnsComponentMap: current columns component map from redux
 */
export function getColumns(
  columns,
  columnsLayout,
  isSidePanelOpen,
  columnsComponentMap,
) {
  if (!columnsComponentMap) {
    return null;
  }
  const columsArr = columns.map((column) => {
    const componentID = columnsComponentMap[column.key];
    const RenderComponent = COLUMN_COMP_IDS[componentID];
    column.render = (text, record) => {
      return <RenderComponent text={text} record={record} />;
    };
    column.width = columnsLayout(isSidePanelOpen)[column.key];
    return column;
  });
  columsArr.push({
    title: 'Action',
    key: 'action',
    width: 100,
    sidePanelVisible: true,
    render: (text, record) => {
      return <Action text={text} record={record} />;
    },
  });
  return columsArr;
}
