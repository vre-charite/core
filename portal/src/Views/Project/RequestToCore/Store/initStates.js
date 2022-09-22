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

export const initStates = {
  loading: false,
  currentPlugin: '',
  route: [], // current geid can be found in the last item of the array,
  page: 0,
  total: 0,
  pageSize: 10,
  sortBy: 'createTime',
  sortOrder: 'desc',
  filter: {},
  columnsComponentMap: null,
  dataOriginal: [],
  data: [],
  selection: [],
  propertyRecord: null,
  isSidePanelOpen: false,
  refreshNum: 0,
  sourceType: 'Project', //"Project"|"Folder"|"TrashFile"
  currentGeid: '',
  hardFreshKey: 0,
};
