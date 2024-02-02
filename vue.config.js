module.exports = {
  devServer: {
      public: process.env.CYTOMINE_URL ? process.env.CYTOMINE_URL : '0.0.0.0'
  }
}
