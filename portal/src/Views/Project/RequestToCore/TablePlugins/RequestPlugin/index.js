import { Entry } from './Entry';
import { PLUGIN_NAME } from './name';
import { Widget } from './Widget';
import { selectionOptions } from './selection';

// how to pass dispatch and redux data to the plugins?
export const plugin = {
  name: PLUGIN_NAME,
  condition: () => true,
  Widget,
  Entry,
  selectionOptions,
};
