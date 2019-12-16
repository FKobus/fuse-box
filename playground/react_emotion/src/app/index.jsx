import * as React from 'react';
import { Fragment } from 'react';

import { GlobalStyle } from '../theme/fuse';

import { Footer } from '../components/footer';
import { Header } from '../components/header';
import { Home } from '../screens/home';

export const App = () => (
  <Fragment>
    <GlobalStyle />
    <Header />
    <Home />
    <Footer />
  </Fragment>
);

export default null;
