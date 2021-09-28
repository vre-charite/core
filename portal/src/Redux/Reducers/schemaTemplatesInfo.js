import { SCHEMA_TEMPLATES } from '../actionTypes';

const init = {
  schemas: [],
  schemaTPLs: [],
  defaultSchemaActiveKey: '',
  customSchemaActiveKey: '',
  defaultPanes: [],
  customPanes: [],
  schemaTypes: 'Default',
  templateManagerMode: 'hide',
  templatesDropdownList: false,
  schemaPreviewGeid: null,
};

export function schemaTemplatesInfo(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case SCHEMA_TEMPLATES.UPDATE_DEFAULT_SCHEMA_LIST: {
      return { ...state, schemas: [...payload] };
    }
    case SCHEMA_TEMPLATES.UPDATE_DEFAULT_SCHEMA_TEMPLATE_LIST: {
      return { ...state, schemaTPLs: [...payload] };
    }
    case SCHEMA_TEMPLATES.SET_DEFAULT_SCHEMA_ACTIVE_KEY: {
      return { ...state, defaultSchemaActiveKey: payload };
    }
    case SCHEMA_TEMPLATES.SET_CUSTOM_SCHEMA_ACTIVE_KEY: {
      return { ...state, customSchemaActiveKey: payload };
    }
    case SCHEMA_TEMPLATES.SET_SCHEMA_TYPES: {
      return { ...state, schemaTypes: payload };
    }
    case SCHEMA_TEMPLATES.ADD_DEFAULT_OPEN_TAB: {
      if (state.defaultPanes.find((el) => el.tplKey == payload.tplKey))
        return {
          ...state,
        };
      return {
        ...state,
        defaultPanes: [...state.defaultPanes, payload],
      };
    }
    case SCHEMA_TEMPLATES.CLEAR_DEFAULT_OPEN_TAB: {
      return {
        ...state,
        defaultPanes: [],
      };
    }
    case SCHEMA_TEMPLATES.REMOVE_DEFAULT_OPEN_TAB: {
      return {
        ...state,
        defaultPanes: state.defaultPanes.filter((el) => el.tplKey !== payload),
      };
    }
    case SCHEMA_TEMPLATES.UPDATE_DEFAULT_OPEN_TAB: {
      const target = state.defaultPanes.find(
        (el) => el.tplKey === payload.target,
      );
      return {
        ...state,
        defaultPanes: [
          ...state.defaultPanes.filter(
            (el) => el.tplKey !== payload.target && el.title !== null,
          ),
          { ...target, ...payload.params },
        ],
      };
    }
    case SCHEMA_TEMPLATES.ADD_CUSTOM_OPEN_TAB: {
      return { ...state, customPanes: [...state.customPanes, payload] };
    }
    case SCHEMA_TEMPLATES.REMOVE_CUSTOM_OPEN_TAB: {
      return {
        ...state,
        customPanes: state.customPanes.filter((el) => el.key !== payload.key),
      };
    }
    case SCHEMA_TEMPLATES.SWITCH_TEMPLATE_MANAGER_MODE: {
      return {
        ...state,
        templateManagerMode: payload,
      };
    }
    case SCHEMA_TEMPLATES.SHOW_TEMPLATES_DROPDOWN_LIST: {
      return {
        ...state,
        templatesDropdownList: payload,
      };
    }
    case SCHEMA_TEMPLATES.SET_PREVIEW_SCHEMA_GEID: {
      return {
        ...state,
        schemaPreviewGeid: payload,
      };
    }
    default:
      return state;
  }
}
