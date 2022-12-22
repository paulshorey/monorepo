module.exports = {
  apps: [
    {
      script: "./dist/index.js",
      node_args: "-r ts-node/register -r tsconfig-paths/register",
      watch: "./dist",
      env: {
        TS_NODE_BASEURL: "./dist"
      }
    }
  ]
}
