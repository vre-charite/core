import _ from 'lodash';

const getFormUpdateActivityLog = (
  originalFormData,
  formData,
  schemaName,
  schemaProperties,
) => {
  const targets = [];
  for (const key of _.keys(formData)) {
    if (!_.isEqual(originalFormData[key], formData[key]))
      targets.push(schemaProperties[key].title);
  }
  const activity = {
    action: 'UPDATE',
    resource: 'Schema',
    detail: {
      name: schemaName,
      targets,
    },
  };

  return [activity];
};

export { getFormUpdateActivityLog };
