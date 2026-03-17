import { withInstall } from '../utils';
import _SelectOptions from './SelectOptions';

export const SelectOptions = withInstall(_SelectOptions);
export default SelectOptions;
export { selectOptionsProps } from './SelectOptions';
export type { SelectOptionsProps } from './SelectOptions';

declare module 'vue' {
  export interface GlobalComponents {
    VanSelectOptions: typeof SelectOptions;
  }
}