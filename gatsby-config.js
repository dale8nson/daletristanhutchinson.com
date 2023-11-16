/**
 * @type {import('gatsby').GatsbyConfig}
 */

const path = require('path');

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
  "gatsby-plugin-postcss",
  "gatsby-transformer-sharp", 
  "gatsby-plugin-sass", 
  // "gatsby-plugin-mdx", 
  // "gatsby-plugin-typescript",
  "gatsby-worker",

  {
    resolve: 'gatsby-source-filesystem',
    options: {
      "name": "images",
      "path": path.join(__dirname, "src", "images")
    },
    resolve: 'gatsby-source-filesystem',
    options: {
      "name": "assets",
      "path": path.join(__dirname,"src","assets")
    },
    __key: "images"
  }, {
    resolve: 'gatsby-source-filesystem',
    options: {
      "name": "pages",
      "path": path.join(__dirname, "src", "pages")
    },
    resolve: `gatsby-plugin-purgecss`,
      options: {
        printRejected: false,
        develop: false,
        tailwind: true,
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
  DEV_SSR: false,
}

};