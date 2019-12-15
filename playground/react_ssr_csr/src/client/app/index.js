import { css } from '@emotion/core';
import * as React from 'react';
import { useState } from 'react';

import { Button, LazyButton } from '../components/button';

// Doesn't work, need a loader/transpiler for it
const styles = css`
  width: 100%;
  text-align: center;

  h1,
  h2,
  h3,
  h4 {
    color: hotpink;
  }
  label:Button__base;
`;

export const App = () => {
  const [count, setCount] = useState(0);
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(currentCount => currentCount - 1);

  return (
    <div css={styles}>
      <h1>🚀 Jättesnabb 🚀</h1>
      <h2>🚀 Jättesnabb 🚀</h2>
      <h3>🚀 Jättesnabb 🚀</h3>
      <h4>🚀 Jättesnabb 🚀</h4>
      <p>Count: {count}</p>
      <LazyButton onClick={() => alert('lazy')}>I'm a fool</LazyButton>
      <Button onClick={increment}>Increment</Button>
      <Button onClick={decrement}>Decrement</Button>
    </div>
  );
};

export default null;


