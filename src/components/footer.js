import * as React from 'react';
import './scss/_footer.scss';
export default function Footer (props) {
 const  { children } = props;
 return (
  <footer className='footer' style={{gridArea:'footer'}}>
    { children }
  </footer>
 );
}