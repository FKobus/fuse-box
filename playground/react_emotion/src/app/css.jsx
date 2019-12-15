import { css } from '@emotion/core';
import * as React from 'react';

const styles1 = css`
  width: 100%;
  text-align: center;
  background: url('this-super-dope-logo.jpg');
  h1,
  h2,
  h3,
  h4 {
    color: hotpink;
  }
  ${{ color: 'white' }}
  ${css`
    background-color: purple;
  `}
  ${'' /* font-size: 12px; */}
`;

const h1styles = css`
  color: hotpink;
`;
const h2styles = css`
  ${css`
    color: deeppink
  `}
`;
const h3styles = css({
  backgroundColor: 'black',
  color: 'white'
});

export const Css = () => (
  <div css={styles1}>
    <h1 css={h1styles}>🚀 Jättesnabb 🚀</h1>
    <h2 css={h2styles}>🚀 eller 🚀</h2>
    <h3 css={h3styles}>🚀 jättesnabb 🚀</h3>
    <h4>🚀 Jättesnabb 🚀</h4>
    <h5 css={css`
      color: lime;
    `}>🚀 Jättesnabb 🚀</h5>
    <div>Click a button</div>
  </div>
);


export default null;


