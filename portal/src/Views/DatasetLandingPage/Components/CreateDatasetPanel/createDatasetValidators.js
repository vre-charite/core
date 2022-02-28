import _ from 'lodash';

//tip: return Promise.reject() won't trigger the validation. You should put a string in the reject();
//also, you should use {validator:()=>{}} rather than {validators:()=>{}}
//you can assume there are no duplicated items in array because of the Antd component's limitation
export const validators = {
  datasetCode: [
    {
      validator: async (rule, value) => {
        if (!value) {
          return Promise.reject('The dataset code is required');
        }
        const regex = new RegExp(/^([a-z0-9]){3,32}$/);
        if (!regex.test(value)) {
          return Promise.reject(
            '3-32 lower case numbers or letters with no white space',
          );
        }
        return Promise.resolve();
      },
    },
  ],
  title: [
    {
      validator: async (rule, value) => {
        if (!value) {
          return Promise.reject('The dataset name is required');
        }
        if (
          typeof value === 'string' &&
          value.length <= 100 &&
          value.length >= 0
        ) {
          return Promise.resolve();
        }
        return Promise.reject(
          "The dataset name's length should be between 1 - 100 characters",
        );
      },
    },
  ],
  authors: [
    {
      validator: async (rule, value) => {
        if (!_.isArray(value) || value.length === 0) {
          return Promise.reject('Please input the authors');
        }

        if (value.length > 10) {
          return Promise.reject('There can be a maximum of 10 authors');
        }

        for (const author of value) {
          if (author.length > 50) {
            return Promise.reject('Maximum length 50 characters');
          }
        }

        return Promise.resolve();
      },
    },
  ],
  description: [
    {
      validator: (rule, value) => {
        if (!value || value.length === 0)
          return Promise.reject('Description is required');

        if (_.trim(value, ' ').length === 0)
          return Promise.reject(
            'Description should not only contain white space',
          );

        if (value.length > 5000) {
          return Promise.reject(
            "The description's length should not exceed 5000 characters",
          );
        }

        return Promise.resolve();
      },
    },
  ],
  modality: [
    {
      validator: (rule, value) => {
        return Promise.resolve();
      },
    },
  ],
  tags: [
    {
      validator: (rule, value) => {
        if (!value || value.length === 0) return Promise.resolve();

        if (value.length > 10) {
          return Promise.reject('The number of tags can not be more than 10');
        }

        for (const tag of value) {
          if (tag.length > 20)
            return Promise.reject('Maximum length 20 characters');
          if (tag.includes(' ')) {
            return Promise.reject('Tag must not include white space');
          }
        }

        return Promise.resolve();
      },
    },
  ],
  collectionMethod: [
    {
      validator: (rule, value) => {
        if (!value || value.length === 0) return Promise.resolve();

        if (value.length > 10) {
          return Promise.reject(
            "The number of method's can not be more than 10",
          );
        }

        for (const method of value) {
          if (method.length > 20)
            return Promise.reject('Maximum length 20 characters');
        }

        return Promise.resolve();
      },
    },
  ],
  license: [
    {
      validator: (rule, value) => {
        if (!value) return Promise.resolve();
        if (value.length > 20) {
          return Promise.reject("The license's length should not exceed 20");
        }
        return Promise.resolve();
      },
    },
  ],
};
