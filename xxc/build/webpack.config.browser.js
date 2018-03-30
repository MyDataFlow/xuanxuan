/**
 * Build config for electron 'Renderer Process' file
 */

import path from 'path';
import webpack from 'webpack';
import validate from 'webpack-validator';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import merge from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import baseConfig from './webpack.config.base';

export default validate(merge(baseConfig, {
    devtool: 'cheap-module-source-map',

    entry: {
        bundle: [
            'babel-polyfill',
            './app/index'
        ],
    },

    output: {
        path: path.join(__dirname, '../app/web-dist'),
        publicPath: '../dist/',
        filename: '[name].js',
        libraryTarget: 'var'
    },

    module: {
        loaders: [
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?minimize=1!less-loader')
            },

            // Fonts
            {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff'},
            {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff'},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream'},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml'},

            // Images
            {
                test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
                loader: 'url-loader'
            }
        ]
    },

    // https://webpack.github.io/docs/configuration.html#resolve
    resolve: {
        extensions: ['', '.js', '.jsx', '.json'],
        packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main'],
        alias: {
            Platform: 'platform/browser',
            Config: 'config/index.js',
            ExtsRuntime: 'platform/browser/exts.js',
            ExtsView: 'platform/browser/exts.js'
        },
        root: path.join(__dirname, '../app')
    },

    plugins: [

        new UglifyJsPlugin(),

        // https://webpack.github.io/docs/list-of-plugins.html#occurrenceorderplugin
        // https://github.com/webpack/webpack/issues/864
        new webpack.optimize.OccurrenceOrderPlugin(),

        // NODE_ENV should be production so that modules do not perform certain development checks
        new webpack.DefinePlugin({
            DEBUG: false,
            'process.env.NODE_ENV': JSON.stringify('production')
        }),

        new ExtractTextPlugin('style.css', {allChunks: true}),

        new HtmlWebpackPlugin({
            filename: '../index.html',
            template: 'app/index.html',
            inject: false
        })
    ],

    target: 'web'
}));
