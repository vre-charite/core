const plugins = {};
const getPlugin = (pluginName) => {
  const fallback = {
    // ... the plugin properties
  };
  return plugins[pluginName] || fallback;
};
const PluginColumnComponents = {};

export { getPlugin, PluginColumnComponents };
