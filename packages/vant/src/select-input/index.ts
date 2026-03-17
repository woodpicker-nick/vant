import { withInstall } from '../utils';
import _SelectInput from './SelectInput';

export const SelectInput = withInstall(_SelectInput);
export default SelectInput;
export { selectInputProps } from './SelectInput';
export type { SelectInputProps } from './SelectInput';

declare module 'vue' {
  export interface GlobalComponents {
    VanSelectInput: typeof SelectInput;
  }
}