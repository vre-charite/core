import _ from 'lodash';
import { objectKeysToSnakeCase } from '../../../Utility';

const infoKeys = [
  'title',
  'authors',
  'type',
  'modality',
  'collectionMethod',
  'license',
];

export const extractValues = (basicInfo) => {
  return _.pick(basicInfo, infoKeys);
};

export const generateSubmitData = (oldValues, newValues, keys = infoKeys) => {
  let activities = [];
  const diffKeys = [];

  for (const key of keys) {
    const oldValue = oldValues[key];
    const newValue = newValues[key];
    if (_.isString(oldValue)) {
      if (oldValue !== newValue) {
        diffKeys.push(key);
        const activity = getActivity('UPDATE', key, oldValue, newValue);
        activities.push(activity);
      }
    } else if (_.isArray(oldValue)) {
      const arrayActivities = diffArray(oldValue, newValue, key);
      if (arrayActivities.length === 0) continue;

      diffKeys.push(key);
      activities = [...activities, ...arrayActivities];
    } else {
      throw new TypeError('The value should be either string or string[]');
    }
  }

  const submitData = { ..._.pick(newValues, diffKeys), activity: activities };
  return objectKeysToSnakeCase(submitData);
};

/**
 * ticket-1645
 * ticket-1678
 * only used in dataset home page
 * @param {"ADD|REMOVE|UPDATE"} action
 * @param {"name"|"authors"|"type"|"modality"|"collectionMethod"|"license"|} resource
 * @param {string|string[]} from
 * @param {string|string[]} to
 */
const getActivity = (action, resource, from, to) => {
  return {
    action,
    resource: `Dataset.${_.startCase(_.camelCase(resource)).replace(/ /g, '')}`,
    detail: {
      from,
      to,
    },
  };
};

/**
 * compare the old and new array value. if the returned for the length of activities[];
 * length === 0: no activity. no need to pick this value;
 * length === 1: either REMOVE or ADD, need to pick the value and concat the returned activities[];
 * length === 2: both REMOVE and ADD, need to pick the value and concat the returned activities[];
 * @param {string[]} oldValue
 * @param {string[]} newValue
 * @param {string} key
 * @returns {Activity[]}
 */
const diffArray = (oldValue, newValue, key) => {
  const oldValueSorted = oldValue.sort();
  const newValueSorted = newValue.sort();
  if (_.isEqual(oldValueSorted, newValueSorted)) {
    return [];
  }

  const removed = _.difference(oldValue, newValue);
  const added = _.difference(newValue, oldValue);

  if (removed.length > 0 && added.length > 0) {
    let middle;

    if (removed.length > 0) {
      const removedSet = new Set(removed);
      middle = oldValue.filter((item) => !removedSet.has(item));
    }

    return [
      getActivity('REMOVE', key, oldValue, middle),
      getActivity('ADD', key, middle, newValue),
    ];
  }

  if (removed.length > 0) {
    return [getActivity('REMOVE', key, oldValue, newValue)];
  }

  return [getActivity('ADD', key, oldValue, newValue)];
};
