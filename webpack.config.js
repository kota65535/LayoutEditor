module.exports = {
    context: __dirname + '/src',

    entry: {
        js: "./entry.js"
    },

    output: {
        path: __dirname + '/dist',
        filename: "./bundle.js"
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },
    devtool: "source-map"
}