import styled from '@emotion/styled';
import * as React from 'react';

export const ExoticBreakingButton = styled.button`
  background-color: black;
  color: ${props => props.primary ? `hotpink` : `green`};
  font-size: 12px;
  ${{ fontWeight: 'bold' }}
  font-family: Verdana, sans-serif;
`;

export default null;

