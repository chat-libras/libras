import type { Theme } from './themes.ts';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
