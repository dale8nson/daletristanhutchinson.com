import * as React from 'react';

import { Button, TabList, Tab, Display, LargeTitle, FluentProvider, teamsLightTheme, makeStyles } from '@fluentui/react-components';
import { TreeItem, Tree } from '@fluentui/react-components/unstable';
import { Notes, Library, Articles, Site, Layout } from './index.js';

import { dThTheme } from '../themes';
import './scss/_admin-layout.scss';
const DEBUG = false;
DEBUG && console.log(`admin-layout.js: Layout: \n${Object.entries(Layout).map(entry => entry.join(':\t')).join('\n')}`);

const  AdminLayout = (props) => {
  const { children } = props;
  const [tab, setTab] = React.useState('');
  const onTabSelect = (event, data) => {
    setTab(data.value);
  }; 
  return (
    <FluentProvider theme={dThTheme.lightTheme}>
      <Layout className='admin-layout' header={true} leftSidebar={true} rightSidebar={true} footer={true}>
        <Layout.Header>
          <Layout.Header.Brand name={(<><strong>O</strong>ffice<strong>M</strong>ate</>)}/>
          <TabList size='large' onTabSelect={onTabSelect}>
            <Tab value='notes-tab'>
              NOTES
            </Tab>
            <Tab value='library-tab'>
              LIBRARY
            </Tab>
            <Tab value='articles-tab'>
              ARTICLES
            </Tab>
            <Tab value='site-tab'>
              SITE
            </Tab>
          </TabList>
        </Layout.Header>
        <Layout.LeftSidebar tab={tab} />
        <Layout.RightSidebar tab={tab} />
        <Layout.MainContent tab={tab}>
          { tab === 'notes-tab' && <Notes />}
          { tab === 'library-tab' && <Library /> }
          { tab === 'articles-tab' && <Articles /> }
          { tab === 'site-tab' && <Site/>}
        </Layout.MainContent>
        <Layout.Footer></Layout.Footer>
      </Layout>
    </FluentProvider>
  )
};

export default AdminLayout;


