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

export const DataSourceType = {
  GREENROOM_HOME: 'GREENROOM_HOME',
  GREENROOM: 'GREENROOM',
  CORE: 'CORE',
  CORE_HOME: 'CORE_HOME',
  CORE_VIRTUAL_FOLDER: 'CORE_VIRTUAL_FOLDER',
  TRASH: 'TRASH',
};
export const PanelKey = {
  GREENROOM_HOME: 'greenroom-home',
  CORE_HOME: 'core-home',
  TRASH: 'trash',
  GREENROOM: 'greenroom',
  CORE: 'core'
};
export const TABLE_STATE = {
  NORMAL: 'NORMAL',
  COPY_TO_CORE: 'COPY_TO_CORE',
  VIRTUAL_FOLDER: 'VIRTUAL_FOLDER',
  DELETE: 'DELETE',
  MANIFEST_APPLY: 'MANIFEST_APPLY',
  ADD_TAGS: 'ADD_TAGS',
  ADD_TO_DATASETS: 'ADD_TO_DATASETS',
};

export const SYSTEM_TAGS = {
  COPIED_TAG: 'copied-to-core',
};
