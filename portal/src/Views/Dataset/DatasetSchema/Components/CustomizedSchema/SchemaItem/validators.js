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

import _ from 'lodash';

export const getValidator = (form, name, isEdit) => {
  return {
    type: [
      {
        validator: async (rule, value) => {
          if (!value) {
            return Promise.reject(`Type is required`);
          }
          return Promise.resolve();
        },
      },
/*       {
        validator: async (rule, value) => {
          console.log(rule,'rule')
          if (isEdit) {
            return Promise.reject(`Can not submit on edit mode`);
          }
          return Promise.resolve();
        },
        validateTrigger: 'onSubmit',
      },
      {
        validator: async (rule, value) => {
          return Promise.resolve();
        },
        validateTrigger: 'onChange',
      }, */
    ],
    title: [
      {
        validator: async (rule, value) => {
          if (!value) {
            return Promise.reject('The title is required');
          }
          const regex = new RegExp(/^(.){1,20}$/);
          if (!regex.test(value)) {
            return Promise.reject(
              'The title can only contains 1-20 characters',
            );
          }

          const { templateItems } = form.getFieldsValue();
          if (_.isArray(templateItems)) {
            const titles = templateItems.map((item) => item.title);
            const counts = _.countBy(titles, (value) => value);
            if (counts[value] > 1) {
              return Promise.reject('Should not have duplicated title');
            }
          }
          return Promise.resolve();
        },
      },
/*       {
        validator: async (rule, value) => {
          if (isEdit) {
            return Promise.reject(`Can not submit on edit mode`);
          }
          return Promise.resolve();
        },
        validateTrigger: 'onSubmit',
      },
      {
        validator: async (rule, value) => {
          return Promise.resolve();
        },
        validateTrigger: 'onChange',
      }, */
    ],

    value: [
      {
        validator: async (rule, formValue) => {
          if (
            form.getFieldValue(['templateItems', name, 'type']) ===
            'multiple-choice'
          ) {
            if (!formValue || formValue.length === 0) {
              return Promise.reject('The options are required');
            }
            if (formValue.length > 10) {
              return Promise.reject('Should have no more than 10 options');
            }
            for (const option of formValue) {
              if (option.length > 20) {
                return Promise.reject(
                  "The option's length should be between 1-20",
                );
              }
            }
          }

          return Promise.resolve();
        },
      },
      /* {
        validator: async (rule, value) => {
         
          if (isEdit) {
            return Promise.reject(`Can not submit on edit mode`);
          }
          return Promise.resolve();
        },
        validateTrigger: 'onSubmit',
      },
      {
        validator: async (rule, value) => {
          return Promise.resolve();
        },
        validateTrigger: 'onChange',
      }, */
    ],
  };
};
