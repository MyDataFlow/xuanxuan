/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import {
    dependencies as externals
} from '../app/package.json';

export default {
    mode: 'production',

    module: {
        rules: [{
            test: /\.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        }],
        // noParse: [/ajv/, /BufferUtil/, /Validation/]
    },

    output: {
        path: path.join(__dirname, '../app'),
        filename: 'bundle.js',

        // https://github.com/webpack/webpack/issues/1114
        libraryTarget: 'commonjs2'
    },

    // https://webpack.github.io/docs/configuration.html#resolve
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        mainFields: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main'],
        alias: {
            Platform: 'platform/electron',
            Config: 'config/index.js',
            ExtsRuntime: 'exts/runtime.js',
            ExtsView: 'views/exts/index.js',
        },
        modules: [
            path.join(__dirname, '../app'),
            'node_modules'
        ]
    },

    plugins: [],

    externals: Object.keys(externals || {})
};
