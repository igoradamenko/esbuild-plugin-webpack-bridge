const path = require('path');
const fs = require('fs');
const assert = require('assert');

const esbuild = require('esbuild');

const bridgePlugin = require('..');

const resolveFixture = (...x) => path.resolve(__dirname, 'fixtures', ...x);

describe('Main tests', () => {
  it('should work with loader whose test defined as regexp', done => {
    const folder = 'regexp';
    const output = readFixture(folder, 'output.js');

    esbuild.build({
      entryPoints: [resolveFixture(folder, 'input.js')],
      nodePaths: [resolveFixture(folder)],
      write: false,
      minify: true,
      bundle: true,
      plugins: [
        bridgePlugin({
          output: {
            path: 'outdir',
          },
          module: {
            rules: [
              {
                test: /\.js$/,
                esbuildLoader: 'js',
                use: [
                  {
                    loader: 'babel-loader',
                    options: {
                      presets: [
                        ['@babel/preset-env', { targets: { ie: 11 } }],
                      ],
                    },
                  },
                ],
              },
            ],
          },
        }),
      ],
    })
      .then(res => {
        assert.deepStrictEqual(res.outputFiles[0].text, output);
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should work with several files imported one into another', done => {
    const folder = 'imports';
    const output = readFixture(folder, 'output.js');

    esbuild.build({
      entryPoints: [resolveFixture(folder, 'input.js')],
      nodePaths: [resolveFixture(folder)],
      write: false,
      minify: true,
      bundle: true,
      plugins: [
        bridgePlugin({
          output: {
            path: 'outdir',
          },
          module: {
            rules: [
              {
                test: /\.js$/,
                esbuildLoader: 'js',
                use: [
                  {
                    loader: 'babel-loader',
                    options: {
                      presets: [
                        ['@babel/preset-env', { targets: { ie: 11 } }],
                      ],
                    },
                  },
                ],
              },
            ],
          },
        }),
      ],
    })
      .then(res => {
        assert.deepStrictEqual(res.outputFiles[0].text, output);
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should work with nested modules paths', done => {
    const folder = 'nested-modules-paths';
    const output = readFixture(folder, 'output.js');

    esbuild.build({
      entryPoints: [resolveFixture(folder, 'input.js')],
      nodePaths: [resolveFixture(folder)],
      write: false,
      minify: true,
      bundle: true,
      plugins: [
        bridgePlugin({
          output: {
            path: 'outdir',
          },
          module: {
            rules: [
              {
                test: /\.js$/,
                esbuildLoader: 'js',
                use: [
                  {
                    loader: 'babel-loader',
                  },
                ],
              },
            ],
          },
        }),
      ],
    })
      .then(res => {
        assert.deepStrictEqual(res.outputFiles[0].text, output);
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should work with rule.loader property', done => {
    const folder = 'loader-property';
    const output = readFixture(folder, 'output.js');

    esbuild.build({
      entryPoints: [resolveFixture(folder, 'input.js')],
      nodePaths: [resolveFixture(folder)],
      write: false,
      minify: true,
      bundle: true,
      plugins: [
        bridgePlugin({
          output: {
            path: 'outdir',
          },
          module: {
            rules: [
              {
                test: /\.js$/,
                esbuildLoader: 'js',
                loader: 'babel-loader',
              },
            ],
          },
        }),
      ],
    })
      .then(res => {
        assert.deepStrictEqual(res.outputFiles[0].text, output);
        done();
      })
      .catch(err => {
        done(err);
      });
  });
});

describe('Loaders', () => {
  it('should work with sass-loader', done => {
    const folder = 'sass-loader';
    const outputJS = readFixture(folder, 'output.js');
    const outputCSS = readFixture(folder, 'output.css');

    esbuild.build({
      entryPoints: [resolveFixture(folder, 'input.js')],
      nodePaths: [resolveFixture(folder)],
      write: false,
      minify: true,
      bundle: true,
      outdir: 'outdir',
      plugins: [
        bridgePlugin({
          output: {
            path: 'outdir',
          },
          module: {
            rules: [
              {
                test: /\.scss$/,
                esbuildLoader: 'css',
                use: [
                  {
                    loader: 'sass-loader',
                    options: {
                      implementation: require('sass'),
                    },
                  },
                ],
              },
            ],
          },
        }),
      ],
    })
      .then(res => {
        assert.deepStrictEqual(res.outputFiles[0].text, outputJS);
        assert.deepStrictEqual(res.outputFiles[1].text, outputCSS);
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should work with postcss-loader', done => {
    const folder = 'postcss-loader';
    const outputJS = readFixture(folder, 'output.js');
    const outputCSS = readFixture(folder, 'output.css');

    esbuild.build({
      entryPoints: [resolveFixture(folder, 'input.js')],
      nodePaths: [resolveFixture(folder)],
      write: false,
      minify: true,
      bundle: true,
      outdir: 'outdir',
      plugins: [
        bridgePlugin({
          output: {
            path: 'outdir',
          },
          module: {
            rules: [
              {
                test: /\.css$/,
                esbuildLoader: 'css',
                use: [
                  {
                    loader: 'postcss-loader',
                    options: {
                      postcssOptions: {
                        plugins: [
                          require('autoprefixer')({
                            overrideBrowserslist: ['> 1%', 'android >= 4.4.4', 'ios >= 9'],
                          }),
                        ],
                      },
                    },
                  },
                ],
              },
            ],
          },
        }),
      ],
    })
      .then(res => {
        assert.deepStrictEqual(res.outputFiles[0].text, outputJS);
        assert.deepStrictEqual(res.outputFiles[1].text, outputCSS);
        done();
      })
      .catch(err => {
        done(err);
      });
  });
});

function readFixture(...pathParts) {
  return fs.readFileSync(resolveFixture(...pathParts), 'utf-8');
}
