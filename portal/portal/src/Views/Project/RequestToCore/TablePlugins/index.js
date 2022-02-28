import { plugin as requestPlugin } from './RequestPlugin';
const pluginsMap = {
  [requestPlugin.name]: requestPlugin,
};

const pluginsContainer = {
  getPluginByName: (name) => {
    if (pluginsMap[name]) {
      return pluginsMap[name];
    }
    return {
      name: '',
      order: 1,
      Widget: () => {},
      Entry: () => {},
    };
  },
  getPluginList: () => {
    return Object.values(pluginsMap).sort((a, b) => {
      return a.order - b.order;
    });
  },
};

export { pluginsContainer };
