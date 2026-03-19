import { withInstall } from '../utils';
import _FormItem from './FormItem';

export const FormItem = withInstall(_FormItem);
export default FormItem;
export { formItemProps } from './FormItem';
export type { FormItemProps } from './FormItem';

declare module 'vue' {
  export interface GlobalComponents {
    VanFormItem: typeof FormItem;
  }
}