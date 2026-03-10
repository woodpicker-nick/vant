import { withInstall } from '../utils';
import _SelectCustomOption from './SelectCustomOption';

export const SelectCustomOption = withInstall(_SelectCustomOption);
export default SelectCustomOption;
export { selectCustomOptionProps } from './SelectCustomOption';
export type { SelectCustomOptionProps } from './SelectCustomOption';

declare module 'vue' {
  export interface GlobalComponents {
    VanSelectCustomOption: typeof SelectCustomOption;
  }
}
