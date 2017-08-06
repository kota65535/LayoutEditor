var webpack = require("webpack");
module.exports = {
    context: __dirname + '/src',

    entry: {
        js: "./index.js"
    },

    output: {
        path: __dirname + '/dist',
        filename: "./bundle.js"
    },

    module: {
        loaders: [
            {
                test: /\.tag$/,
                exclude: /node_modules/,
                loader: 'riot-tag-loader',
                query: {
                    type: 'es6', // transpile the riot tags using babel
                    hot: true,
                    debug: true
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'stage-0']
                }
            },
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader' },
            { test: /\.(woff|woff2)$/, loader: 'url-loader?prefix=font/&limit=5000' },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/octet-stream' },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml' },
        ]
    },

    plugins: [
        // for bootstrap 4
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default'],
            "Tether": 'tether',
            $$: 'jquery-selector-cache',
            _: 'lodash',
        })
    ],

    resolve: {
        extensions: ['.js', '.jsx'],
    },


    devtool: "source-map"
}