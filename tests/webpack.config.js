module.exports = {
    entry: __dirname + '/index.js',
    output: {
        path: __dirname + '/',
        filename: 'spec.js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel',
            exclude: /node_modules/
        }]
    }
}
