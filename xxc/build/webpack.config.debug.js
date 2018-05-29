/**
 * Build config for electron 'Renderer Process' file
 */

import path from 'path';
import webpack from 'webpack';
import validate from 'webpack-validator';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import merge from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import baseConfig from './webpack.config.base';

export default validate(merge(baseConfig, {
    debug: true,

    devtool: 'inline-source-map',

    entry: {
        bundle: [
            'babel-polyfill',
            './app/index'
        ]
    },

    output: {
        path: path.join(__dirname, '../app/dist'),
        publicPath: '../dist/',
        filename: '[name].js',
    },

    module: {
        loaders: [

            // Fonts
            {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff'},
            {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff'},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream'},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml'},

            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader')
            },

            // Images
            {
                test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
                loader: 'url-loader'
            }
        ]
    },

    plugins: [
        // for bindings package, see https://github.com/rwaldron/johnny-five/issues/1101#issuecomment-213581938
        new webpack.ContextReplacementPlugin(/bindings$/, /^$/),

        // NODE_ENV should be production so that modules do not perform certain development checks
        new webpack.DefinePlugin({
            DEBUG: true,
            'process.env.NODE_ENV': JSON.stringify('debug')
        }),

        new ExtractTextPlugin('style.css', {allChunks: true}),

        new HtmlWebpackPlugin({
            filename: '../index.html',
            template: 'app/index.html',
            inject: false
        })
    ],

    externals: ['bindings'],

    // https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
    target: 'electron-renderer'
}));
