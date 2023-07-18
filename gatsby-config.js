/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `Dale Tristan Hutchinson`,
    siteUrl: `https://daletristanhutchinson.com`
  },
  plugins: [{
    resolve: 'gatsby-source-wordpress',
    options: {
      "url": "http://192.168.64.2/wp-dev/graphql"
    }
  }, 
  "gatsby-plugin-image", 
  "gatsby-plugin-sharp", 
  "gatsby-transformer-sharp", 
  "gatsby-plugin-sass", 
  "gatsby-plugin-mdx", 
  "gatsby-plugin-typescript",
  "gatsby-plugin-theme-ui",
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      "name": "images",
      "path": "./src/images/"
    },
    __key: "images"
  }, {
    resolve: 'gatsby-source-filesystem',
    options: {
      "name": "pages",
      "path": "./src/pages/"
    },
    __key: "pages"
  }, {
    resolve: 'gatsby-source-filesystem',
    options: {
      "name": "articles",
      "path": "./articles/"
    }
  
},
{
  resolve: "gatsby-plugin-react-svg",
  options: {
    rule: {
      include: /images\/.*[.]svg$/
    }
  }
}]
};