module.exports = function(api) {
  api.cache(true);

  const presets = [
    [
      '@babel/env',
      {
        targets: {
          node: true,
        },
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
  ];
  const plugins = ['@babel/plugin-transform-modules-commonjs'];

  return {
    presets,
    plugins,
  };
};
