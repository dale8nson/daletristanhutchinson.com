/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `Dale Tristan Hutchinson`,
    siteUrl: `https://daletristanhutchinson.com`
  },
  pathPrefix: "/",
  jsxRuntime: "automatic",
  jsxImportSource: "@emotion/react",
  plugins: [
  "gatsby-plugin-image", 
  "gatsby-plugin-sharp", 
  "gatsby-transformer-sharp", 
  "gatsby-plugin-sass", 
  // "gatsby-plugin-mdx", 
  "gatsby-plugin-typescript",
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
  }, //{
  //   resolve: 'gatsby-source-filesystem',
  //   options: {
  //     "name": "articles",
  //     "path": "./articles/"
  //   }
  // },
{
  resolve: "gatsby-plugin-react-svg",
  options: {
    rule: {
      include: /images\/.*[.]svg$/,
    }
  }
}],

flags: {
  DEV_SSR: true,
}

};