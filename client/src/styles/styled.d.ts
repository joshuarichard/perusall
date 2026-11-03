// Augment styled-components' DefaultTheme so ${({ theme }) => ...}
// gets full type inference on our theme tokens.
import 'styled-components';
import type { Theme } from './theme';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
