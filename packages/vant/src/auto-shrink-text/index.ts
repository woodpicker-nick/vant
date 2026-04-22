import { withInstall } from '../utils';
import _AutoShrinkText from './AutoShrinkText';

export const AutoShrinkText = withInstall(_AutoShrinkText);
export default AutoShrinkText;
export { autoShrinkTextProps } from './AutoShrinkText';

export type { AutoShrinkTextProps } from './AutoShrinkText';

declare module 'vue' {
  export interface GlobalComponents {
    VanAutoShrinkText: typeof AutoShrinkText;
  }
}