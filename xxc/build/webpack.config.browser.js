/**
 * Build config for electron 'Renderer Process' file
 */

import path from 'path';
import webpack from 'webpack';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import merge from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import baseConfig from './webpack.config.base';

export default merge(baseConfig, {
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
        rules: [
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'less-loader']
                })
            },

            // Fonts
            {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff'},
            {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff'},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/octet-stream'},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader'},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml'},

            // Images
            {
                test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
                loader: 'url-loader'
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
            ExtsView: 'platform/browser/exts.js'
        },
        modules: [
            path.join(__dirname, '../app'),
            'node_modules'
        ]
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
});
