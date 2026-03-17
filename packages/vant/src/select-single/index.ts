import { withInstall } from '../utils';
import _SelectSingle from './SelectSingle';

export const SelectSingle = withInstall(_SelectSingle);
export default SelectSingle;
export { selectSingleProps } from './SelectSingle';
export type { SelectSingleProps } from './SelectSingle';

declare module 'vue' {
  export interface GlobalComponents {
    VanSelectSingle: typeof SelectSingle;
  }
}