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
