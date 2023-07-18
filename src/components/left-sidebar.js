import * as React from 'react';

export default function LeftSideBar (props) {
 const  {children} = props;
 return (
  <div style={{gridArea:'left-sidebar'}}>
    {children}
  </div>
 );
}