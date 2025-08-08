const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({

  name: 'frontend',

  remotes: {
    "mfeReact": "mfeReact@http://localhost:4201/remoteEntry.js",
  },

  exposes: {
    './Component': './src/app/app.component.ts',
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

});
