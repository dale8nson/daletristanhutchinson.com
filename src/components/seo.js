import * as React from 'react';
import { graphql, useStaticQuery} from 'gatsby';

const Seo = ({title}) => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);
  const text = `${title} | ${data.site.siteMetadata.title}`;
  return (
    <title>{text}</title>
  )
};

export default Seo;