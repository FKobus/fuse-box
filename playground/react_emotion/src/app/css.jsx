import { css } from '@emotion/core';
import * as React from 'react';

const styles = css`
  width: 100%;
  text-align: center;

  h1,
  h2,
  h3,
  h4 {
    color: hotpink;
  }
`;

// label:Button__base;

export const Css = () => (
  <div css={styles}>
    <h1>🚀 Jättesnabb 🚀</h1>
    <h2>🚀 Jättesnabb 🚀</h2>
    <h3>🚀 Jättesnabb 🚀</h3>
    <h4>🚀 Jättesnabb 🚀</h4>
  </div>
);


export default null;


