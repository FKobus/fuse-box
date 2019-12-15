import { css } from '@emotion/core';
import * as React from 'react';

const styles1 = css`
  width: 100%;
  text-align: center;

  h1,
  h2,
  h3,
  h4 {
    color: hotpink;
  }
`;
const h1styles = css`
  color: hotpink;
`;
const h2styles = css`
  ${css`
    color: deeppink
  `}
`;

// label:Button__base;

export const Css = () => (
  <div css={styles1}>
    <h1 css={h1styles}>🚀 Jättesnabb 🚀</h1>
    <h2 css={h2styles}>🚀 Jättesnabb 🚀</h2>
    <h3>🚀 Jättesnabb 🚀</h3>
    <h4>🚀 Jättesnabb 🚀</h4>
    <h5 css={css`
      color: lime;
    `}>🚀 Jättesnabb 🚀</h5>
  </div>
);


export default null;


