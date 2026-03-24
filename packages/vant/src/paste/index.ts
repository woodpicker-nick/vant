import { withInstall } from '../utils';
import _Paste from './Paste';

export const Paste = withInstall(_Paste);
export default Paste;
export { pasteProps } from './Paste';
export type { PasteProps } from './Paste';

declare module 'vue' {
  export interface GlobalComponents {
    VanPaste: typeof Paste;
  }
}