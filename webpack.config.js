module.exports = {
    // context: __dirname + '/src',

    entry: {
        js: __dirname + "/src/index.js"
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
            }
        ]
    },
    devtool: "source-map"
}
