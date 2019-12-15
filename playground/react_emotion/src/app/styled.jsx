import styled from '@emotion/styled';
import * as React from 'react';

// regular button
const Button = styled.button`
  color: turquoise;
`;
// button with props
const ButtonWithProps = styled.button`
  color: ${props =>
    props.primary ? 'hotpink' : 'green'};
`;
const Container = styled.div(props => ({
  display: 'flex',
  flexDirection: props.column && 'column',
  width: '50%'
}));

// Styling any component
const Basic = ({ className }) => (
  <div className={className}>Some text</div>
);
const Fancy = styled(Basic)`
  color: hotpink;
  margin-top: 200px;
`;

export const Styled = () => (
  <div>
    <h1>🚀 Jättesnabb 🚀</h1>
    <Button>Super simple button</Button>
    <h2>🚀 Jättesnabb 🚀</h2>
    <Container column>
      <ButtonWithProps>This is a regular button.</ButtonWithProps>
      <ButtonWithProps primary>This is a primary button.</ButtonWithProps>
    </Container>
    <h2>🚀 Jättesnabb 🚀</h2>
    <Container>
      <ButtonWithProps>This is a regular button.</ButtonWithProps>
      <ButtonWithProps primary>This is a primary button.</ButtonWithProps>
    </Container>
    <Fancy />
  </div>
);

export default null;
