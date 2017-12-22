const path = require('path');


const COMPILE = (process.env.NODE_ENV === 'compile');

let config = {
    entry: {
        'video/index': path.join(__dirname,'./test/video'),
        'image/index': path.join(__dirname,'./test/image')
    },
    output: {
        path: path.join(__dirname, './example'),
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