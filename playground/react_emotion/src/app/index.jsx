import * as React from 'react';

import { Css } from './css';
import { CustomCss } from './customCss';
import { ExoticBreakingButton } from './exotic';
import { Styled } from './styled';

export const App = () => (
  <div>
    <ExoticBreakingButton primary>Super Exotic working button</ExoticBreakingButton>
    <ExoticBreakingButton>Super Exotic working button</ExoticBreakingButton>
    <Css />
    <CustomCss />
    <Styled />
  </div>
);

export default null;
