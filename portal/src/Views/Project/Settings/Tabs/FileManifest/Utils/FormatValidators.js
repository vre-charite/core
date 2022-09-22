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

import { trimString } from '../../../../../../Utility';
import i18n from '../../../../../../i18n';
export function validateManifestName(manifestName, manifestList) {
  if (!manifestName) {
    return {
      valid: false,
      err: `${i18n.t('formErrorMessages:manifestSettings.manifestName.empty')}`,
    };
  }
  let manifestNameTrim = trimString(manifestName);
  const specialChars = ['\\', '/', ':', '?', '*', '<', '>', '|', '"', "'"];
  if (manifestNameTrim.length === 0 || manifestNameTrim.length > 32) {
    return {
      valid: false,
      err: `${i18n.t(
        'formErrorMessages:manifestSettings.manifestName.length',
      )}`,
    };
  }
  for (let char of specialChars) {
    if (manifestNameTrim.indexOf(char) !== -1) {
      return {
        valid: false,
        err: `${i18n.t(
          'formErrorMessages:manifestSettings.manifestName.format',
        )}`,
      };
    }
  }
  const duplicate = manifestList.find((v) => v.name === manifestNameTrim);
  if (duplicate) {
    return {
      valid: false,
      err: `${i18n.t(
        'formErrorMessages:manifestSettings.manifestName.existent',
      )}`,
    };
  }
  return {
    valid: true,
    err: null,
  };
}

export function validateAttributeName(attributeName, otherAttrs) {
  if (!attributeName) {
    return {
      valid: false,
      err: `${i18n.t(
        'formErrorMessages:manifestSettings.attributeName.empty',
      )}`,
    };
  }
  let attributeNameTrim = trimString(attributeName);
  if (!attributeNameTrim) {
    return {
      valid: false,
      err: `${i18n.t(
        'formErrorMessages:manifestSettings.attributeName.empty',
      )}`,
    };
  }
  if (attributeNameTrim.length === 0 || attributeNameTrim.length > 32) {
    return {
      valid: false,
      err: `${i18n.t(
        'formErrorMessages:manifestSettings.attributeName.length',
      )}`,
    };
  }
  if (!/^[A-Za-z0-9]+$/i.test(attributeNameTrim)) {
    return {
      valid: false,
      err: `${i18n.t(
        'formErrorMessages:manifestSettings.attributeName.format',
      )}`,
    };
  }
  const existentAttr = otherAttrs.find((x) => x.name === attributeNameTrim);
  if (existentAttr) {
    return {
      valid: false,
      err: `${i18n.t(
        'formErrorMessages:manifestSettings.attributeName.existent',
      )}`,
    };
  }
  return {
    valid: true,
    err: null,
  };
}

export function validateAttrValue(attributeVal) {
  if (!attributeVal) {
    return {
      valid: false,
      err: `${i18n.t(
        'formErrorMessages:manifestSettings.attributeValue.length',
      )}`,
    };
  }
  let attributeValTrim = trimString(attributeVal);
  if (attributeValTrim.length === 0 || attributeValTrim.length > 32) {
    return {
      valid: false,
      err: `${i18n.t(
        'formErrorMessages:manifestSettings.attributeValue.length',
      )}`,
    };
  }
  if (!/^[A-Za-z0-9_!%&/()=?*+#.;-]+$/i.test(attributeValTrim)) {
    return {
      valid: false,
      err: `${i18n.t(
        'formErrorMessages:manifestSettings.attributeValue.format',
      )}`,
    };
  }
  return {
    valid: true,
    err: null,
  };
}
