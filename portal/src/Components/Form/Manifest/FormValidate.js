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
