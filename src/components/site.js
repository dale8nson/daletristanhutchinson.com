import * as React from 'react';
// import parse from 'html-react-parser';
// import { useStaticQuery, graphql } from 'gatsby';
// import Header from './header';
import './scss/_site.scss';

const Site = React.memo(() => {
    // const siteData = useStaticQuery(graphql`query MyQuery {
    //   wpPage(contentType: {node: {}}, isFrontPage: {eq: true}) {
    //     id
    //     template {
    //       templateName
    //     }
    //     content
    //   }
    // }`);
  
  // const gq = siteData.content;
  // const [element, setElement] = React.useState(null);
  const request = new Request('httpsL//www/theage.com.au/',{mode:'no-cors'});

  // fetch('http://192.168.64.2/wp-dev/',{mode:'no-cors'})
  // .then(res => res.text())
  // .then(res => parse(res))
  // .then(console.log)
  // .then(setElement)
  // .catch(err => console.log(err));

  // console.log(`element.value: ${element.value}`);
    // const element = parse(siteData.wpPage.content);
  const style = {
    width: '100%',
    height: '100%',
    // margin:'10%',
    overflow: 'auto'
  }
  // if (element) {
  //   console.log(element);
  return (
    <div className='site-tab' role='tabpanel' style={style}>
      <iframe title='Live Preview' src='http://192.168.64.2/wp-dev'/>
    </div>
  );
  // }
  // return null;
});

export default Site;

