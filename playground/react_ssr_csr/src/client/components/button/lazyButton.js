import { Fragment } from 'react';
import * as React from 'react';

export const LazyButton = ({ children, onClick = () => {}, ...props }) => (
  <Fragment>
    <button onClick={onClick} style={{ marginLeft: '12px' }}>
      {children}
    </button>
    <div>Jooo {props && props.length > 0 && props.map(p => p)}</div>
  </Fragment>
);

export default LazyButton;
