/** @jsxImportSource theme-ui */
// import * as React from 'react';
import { Seo, Deiru, Layout } from '../components';
import { home } from '../themes';
import { Link } from 'gatsby';
import './scss/_index.scss';
import { ThemeUIProvider } from 'theme-ui';
const IndexPage =  () => {
  return (
    <ThemeUIProvider theme={ home }>
    <Layout header>
      <Layout.Header>
      <Deiru/>
      <video  autoplay width='200'>
        <source src='../videos/DTH.webm' type='video/webm' />
      </video>
      </Layout.Header>
      <Layout.MainContent>
        <nav>
          <ul>
          <li><Link to='/admin/'>Admin Panel</Link></li>
          <li><Link to='/landing-1/'>Example Landing Page 1</Link></li>
        </ul>
        </nav>
      </Layout.MainContent>
    </Layout>
    </ThemeUIProvider>
  )
};

export default IndexPage;

export const Head = () => <Seo title='Home'/>;