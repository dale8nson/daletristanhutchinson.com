import * as React from 'react';

export default function RightSideBar (props) {
 const  {children} = props;
 return (
  <div style={{gridArea:'right-sidebar'}}>
    {children}
  </div>
 );
}