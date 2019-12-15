import * as React from 'react';
import { css, jsx } from '@emotion/core';

const styles = css`
  margin-left: 12px;
`;

export const Button = ({ children, onClick = () => {} }) => (
  <button onClick={onClick} css={styles}>
    {children}
  </button>
);

export default null;
