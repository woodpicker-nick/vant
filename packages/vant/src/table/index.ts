import { withInstall } from '../utils';
import _Table from './Table';

export const Table = withInstall(_Table);
export default Table;
export { tableProps } from './Table';
export type { TableProps } from './Table';

declare module 'vue' {
  export interface GlobalComponents {
    VanTable: typeof Table;
  }
}
