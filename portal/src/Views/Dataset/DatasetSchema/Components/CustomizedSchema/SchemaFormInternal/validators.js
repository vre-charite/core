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

import _ from 'lodash'

export const validators = {
  templateName: (templates) => {
    return [
      {
        validator: async (rule, value) => {
          const isDuplicated = _.find(templates, (item) => value === item.name);
          if (isDuplicated) {
            return Promise.reject(`The template name has been taken`);
          }
          return Promise.resolve();
        },
      },
      {
        validator: async (rule, value) => {
          if (!value) {
            return Promise.reject('The template name is required');
          }
          const regex = new RegExp(/^(.){1,30}$/);
          if (!regex.test(value)) {
            return Promise.reject(
              'The template name can only contains 1-30 characters',
            );
          }
          return Promise.resolve();
        },
      },
    ];
  },
};
