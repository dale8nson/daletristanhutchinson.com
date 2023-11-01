import * as React from 'react';
// import './scss/_header.scss';
export default function Header (props) {
 const  { children } = props;
 return (
  <header className='header' style={{gridArea:`header`}}>
    { children }
  </header>
 );
}