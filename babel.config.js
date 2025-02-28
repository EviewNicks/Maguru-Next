module.exports = (api) => {
  api.cache(true)
  const useBabel = process.env.USE_BABEL === 'true'

  return {
    presets: useBabel
      ? [
          [
            '@babel/preset-env',
            {
              targets: { node: 'current' },
              modules: 'commonjs',
            },
          ],
          '@babel/preset-typescript',
          ['@babel/preset-react', { runtime: 'automatic' }],
        ]
      : [],
    plugins: useBabel ? [] : [],
  }
}
