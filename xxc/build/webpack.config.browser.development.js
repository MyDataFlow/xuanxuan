/* eslint-disable max-len */
/**
 * Build config for development process that uses Hot-Module-Replacement
 * https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
 */

import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';
import baseConfig from './webpack.config.base';

const port = process.env.PORT || 3000;

export default merge(baseConfig, {
    mode: 'development',

    devtool: 'inline-source-map',

    entry: {
        bundle: [
            `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr`,
            'babel-polyfill',
            './app/index'
        ],
    },

    output: {
        publicPath: `http://localhost:${port}/dist/`,
        filename: '[name].js',
        libraryTarget: 'var'
    },

    module: {
        rules: [
            // Fonts
            {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff'},
            {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff'},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/octet-stream'},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader'},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml'},

            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader?importLoaders=1&minimize=1&sourceMap',
                    'less-loader?strictMath&noIeCompat&sourceMap'
                ]
            }
        ]
    },

    // https://webpack.github.io/docs/configuration.html#resolve
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        mainFields: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main'],
        alias: {
            Platform: 'platform/browser',
            Config: 'config/index.js',
            ExtsRuntime: 'platform/browser/exts.js',
            ExtsView: 'platform/browser/exts.js',
        },
        modules: [
            path.join(__dirname, '../app'),
            'node_modules'
        ]
    },

    plugins: [

        // https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
        new webpack.HotModuleReplacementPlugin(),

        // “If you are using the CLI, the webpack process will not exit with an error code by enabling this plugin.”
        // https://webpack.docschina.org/plugins/no-emit-on-errors-plugin/
        new webpack.NoEmitOnErrorsPlugin(),

        // NODE_ENV should be production so that modules do not perform certain development checks
        new webpack.DefinePlugin({
            DEBUG: true,
            'process.env.NODE_ENV': JSON.stringify('development')
        }),

        // https://webpack.docschina.org/guides/migrating/#debug
        new webpack.LoaderOptionsPlugin({
            debug: true
        })
    ],

    target: 'web'
});
