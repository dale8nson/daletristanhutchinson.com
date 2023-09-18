exports.onCreateWebpackConfig = ({
  actions
}) => {
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\/assets\/.+\.png$/,
          use: [
            `file-loader`
          ]
        }
      ]
    }
  })
}