import * as React from 'react';

export default function MainContent (props) {
  const { children } = props;

  return (
    <main className='main-content' style={{gridArea:'main-content'}}>
      { children }
    </main>
  );
}