const path = require('path');


const COMPILE = (process.env.NODE_ENV === 'compile');

let config = {
    entry: {
        index: path.join(__dirname,'./test/index')
    },
    output: {
        path: path.join(__dirname, './dev/'),
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            use: [{
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }]
        }]
    },
    resolve:{
        modules: [path.resolve(__dirname, "src"), "node_modules"]
    }

}


module.exports = config;