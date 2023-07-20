import * as React from 'react';
import {LargeTitle} from '@fluentui/react-components';
import { alt } from '../utils';
import Brand from './index.js';
// import './scss/_layout.scss';

const DEBUG = true;
const Layout = (props) => {
  const { className, header, leftSidebar, rightSidebar, footer, children } = props;

  DEBUG && console.log(`props: ${Object.keys(props)}`);
  DEBUG && console.log(`header: ${header} leftSidebar: ${leftSidebar} rightSidebar: ${rightSidebar} footer: ${footer}`);
  DEBUG && console.log(`children: ${children}`);
  const style = {
    gridTemplateColumns: `minmax(max-content,15%) 1fr minmax(max-content,15%)`,
    gridTemplateRows: `minmax(max-content, 15%) 1fr minmax(max-content, 15%)`,
    // gridTemplateAreas: `"${alt`header/left-sidebar/!main-content,header/!main-content,header/right-sidebar/!main-content`}" "${alt`left-sidebar/!main-content, !main-content,right-sidebar/!main-content`}"
    //                    "${alt`footer/left-sidebar/!main-content,footer/!main-content,footer/right-sidebar/!main-content`}"`
    gridTemplateAreas: `"${header ? 'header' : leftSidebar ? 'left-sidebar' : 'main-content'} ${header ? 'header' : 'main-content'} ${header ? 'header' : rightSidebar ? 'right-sidebar' : 'main-content'}"
                        "${leftSidebar ? 'left-sidebar' : 'main-content'} main-content ${rightSidebar ? 'right-sidebar' : 'main-content'}"
                        "${footer ? 'footer' : leftSidebar ? 'left-sidebar' : 'main-content'} ${footer ? 'footer' : 'main-content'} ${footer ? 'footer' : rightSidebar ? 'right-sidebar' : 'main-content'}"`
  }
  DEBUG && console.log(`style.gridTemplateAreas: ${style.gridTemplateAreas}`)
  return (
    <div className={`layout ${className}`} style={style}>
      {children}
    </div>
  );
}; 


Layout.Header = ({className, children}) => (

  <div className={`header ${className}`} style={{gridArea:'header', position:'relative', display: 'flex', margin:'1%', zIndex:'5', overflow:'visible'}}>
    {children}
  </div>

);

Layout.Header.Brand = (props) => {
  const { name } = props;
  return (
    <div className='brand'>
      <div className='brand-name'>
      <div className='brand-link'>
        <a href='/'>
          <LargeTitle className='brand-text'>{ name }</LargeTitle>
        </a>
        </div>
      </div>
    </div>
  ); 
};

Layout.LeftSidebar = ({className, children}) => (

  <div className={`left-sidebar ${className}`} style={{gridArea:'left-sidebar'}}>
    {children}
  </div>

);

Layout.RightSidebar = ({className, children}) => (

  <div className={`right-sidebar ${className}`} style={{gridArea:'right-sidebar'}}>
    {children}
  </div>

);

Layout.MainContent = ({className, children}) => (

  <div className={className} style={{gridArea:'main-content'}}>
    {children}
  </div>

);

Layout.Footer = ({className, children}) => (

  <div className={`footer ${className}`} style={{gridArea:'footer'}}>
    {children}
  </div>
);
DEBUG && console.log(`Layout: ${Object.entries(Layout)}`);

export default Layout;