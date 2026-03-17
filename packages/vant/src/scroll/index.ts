import { withInstall } from '../utils';
import _Scroll from './Scroll';

export const Scroll = withInstall(_Scroll);
export default Scroll;
export { scrollProps } from './Scroll';
export type { ScrollProps } from './Scroll';

declare module 'vue' {
  export interface GlobalComponents {
    VanScroll: typeof Scroll;
  }
}
