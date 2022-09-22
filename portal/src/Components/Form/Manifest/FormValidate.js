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

import { MANIFEST_ATTR_TYPE } from '../../../Views/Project/Settings/Tabs/manifest.values';
import i18n from '../../../i18n';
export function validateForm(attrForm, manifest) {
  const maxHave = manifest.attributes.filter((attr) => !attr.optional);
  for (let attr of maxHave) {
    if (!attrForm[attr.name]) {
      return {
        valid: false,
        err: `${i18n.t('formErrorMessages:manifestAttrsForm.attr.required')}`,
      };
    }
  }
  for (let attr of manifest.attributes) {
    if (
      attr.type === MANIFEST_ATTR_TYPE.TEXT &&
      attrForm[attr.name] &&
      attrForm[attr.name].length > 100
    ) {
      return {
        valid: false,
        err: `${i18n.t('formErrorMessages:manifestAttrsForm.attr.text')}`,
      };
    }
  }
  return {
    valid: true,
    err: null,
  };
}
