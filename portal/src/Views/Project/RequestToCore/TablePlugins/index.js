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

import { plugin as requestPlugin } from './RequestPlugin';
const pluginsMap = {
  [requestPlugin.name]: requestPlugin,
};

const pluginsContainer = {
  getPluginByName: (name) => {
    if (pluginsMap[name]) {
      return pluginsMap[name];
    }
    return {
      name: '',
      order: 1,
      Widget: () => {},
      Entry: () => {},
    };
  },
  getPluginList: () => {
    return Object.values(pluginsMap).sort((a, b) => {
      return a.order - b.order;
    });
  },
};

export { pluginsContainer };
