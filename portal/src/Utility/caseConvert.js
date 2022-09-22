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

const _ = require("lodash");

/**
 * covert a snake case object's keys to camelCase, for JSON from backend
 *
 * @param {object} snake_case_object snake_case object
 * @returns {object} a new object with all camelCase keys
 */
function objectKeysToCamelCase(snake_case_object) {
  var camelCaseObject = _.isArray(snake_case_object) ? [] : {};
  _.forEach(snake_case_object, function(value, key) {
    if (_.isPlainObject(value) || _.isArray(value)) {
      // checks that a value is a plain object or an array - for recursive key conversion
      value = objectKeysToCamelCase(value); // recursively update keys of any values that are also objects
    }
    camelCaseObject[_.camelCase(key)] = value;
  });
  return camelCaseObject;
}

/**
 * covert a camel case object's keys to snake case, for JSON ready to be sent to backend
 *
 * @param {object} camelCaseObject camel case object
 * @returns {object} snake case object
 */
function objectKeysToSnakeCase(camelCaseObject) {
  var snakeCaseObject = _.isArray(camelCaseObject) ? [] : {};
  _.forEach(camelCaseObject, function(value, key) {
    if (_.isPlainObject(value) || _.isArray(value)) {
      // checks that a value is a plain object or an array - for recursive key conversion
      value = objectKeysToSnakeCase(value); // recursively update keys of any values that are also objects
    }
    snakeCaseObject[_.snakeCase(key)] = value;
  });
  return snakeCaseObject;
}

export { objectKeysToCamelCase, objectKeysToSnakeCase };
