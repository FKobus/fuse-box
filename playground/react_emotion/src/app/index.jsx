import * as React from 'react';
import { Fragment } from 'react';
import { css } from '@babel/core';

// import { GlobalStyle } from '../theme/fuse';

// import { Footer } from '../components/footer';
// import { Header } from '../components/header';
// import { Home } from '../screens/home';
const styles1 = css({
  backgroundColor: 'hotpink'
});
const styles2 = css({
  color: 'white'
});

export const App = () => (
  <Fragment>
    <div css={css`background-color: hotpink; color:white;`}>SUper DUper</div>
    <div css={[styles1, styles2]}>SUper DUper</div>
    <div css={{ backgroundColor: 'hotpink', color: 'white' }}>SUper DUper</div>
    {/* <GlobalStyle /> */}
    {/* <Header /> */}
    {/* <Home /> */}
    {/* <Footer /> */}
  </Fragment>
);

export default null;
