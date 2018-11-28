/*
 * webpack
 *
 * 一个功能强大的打包工具
 *
 * 配置文档 https://www.webpackjs.com/configuration/ （有提供中文版）
 *
 */

// 引入 NodeJS 的路径处理库
// https://nodejs.org/api/path.html
var path = require("path");

// webpack 插件，用于简化 HTML 文件生成
// https://github.com/jantimon/html-webpack-plugin
const HtmlWebpackPlugin = require('html-webpack-plugin');

// webpack 插件，用于新的构建之前清理输出目录
// https://www.npmjs.com/package/clean-webpack-plugin
const CleanWebpackPlugin = require('clean-webpack-plugin')

// 检查当前运行环境
function isProd() {
    return process.env.NODE_ENV ==='production';
}


config = {
    entry: {
        app: ["./src/index.js"]
    },
    // 设定输出文件的存储路径, 文件名称的格式
    output: {

        // 输出路径，必须为绝对路径
        // path.resolve将参数连接成一个完成的路径. https://nodejs.org/api/path.html#path_path_resolve_paths
        path: path.resolve(__dirname, "dist"),

        // 公开部署路径，不可以填入 ./ 否则会导致异常
        publicPath: "/",

        // 指定输出文件名
        filename: "bundle.js"
    },
    // 决定如何处理模块引用，主要用于操纵改写路径（对 css/less 文件无效）
    // https://www.webpackjs.com/configuration/resolve/
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            'public': path.resolve(__dirname, 'public'),
            'img': path.resolve(__dirname, 'src/assets/img/'),
            'pro': path.resolve(__dirname, 'src/pro-components/'),
            'comp': path.resolve(__dirname, 'src/components/')
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        // babel: "babel-loader@^8.0.0-beta.2"
                        // 支持 ES 6 和 React 语法
                        presets: ['@babel/preset-env', '@babel/preset-react'],

                        // @babel/plugin-proposal-class-properties
                        // 支持属性定义语法 https://github.com/tc39/proposal-class-fields

                        // @babel/plugin-syntax-dynamic-import
                        // 支持动态导入语法

                        // babel-plugin-import
                        // 支持组件引入语法 https://www.cnblogs.com/yswz/p/7165031.html

                        // @babel/plugin-proposal-decorators
                        // 支持类似JAva 注解一样的语法，必须位于 class-properties 之前不然会出现莫名错误。
                        plugins: [["@babel/plugin-proposal-decorators", { "legacy": true }], '@babel/plugin-proposal-class-properties', '@babel/plugin-syntax-dynamic-import', ['babel-plugin-import',
                            {libraryName: 'antd', libraryDirectory: 'es', style: 'css'}], ]
                    }
                }
            },

            // 处理普通文件，允许向引用模块一样引用这些资源，并自动拷贝到输出目录
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loader: 'file-loader', // https://github.com/webpack-contrib/file-loader
                options: {
                    name: '[name].[ext]'
                }
            },

            // 处理 CSS 和 Less 文件
            {
                test: /\.(css|less)$/,
                exclude: /node_modules/,
                use: [
                    {
                        // 将返回的 css 内容插入到页面(<head><style>...</style></header>
                        // https://github.com/webpack-contrib/style-loader
                        // https://stackoverflow.com/questions/34039826/webpack-style-loader-vs-css-loader
                        loader: "style-loader"
                    },
                    {
                        // 读取并返回 css 内容 （并处理里面的@import and url() 语句）
                        // https://github.com/webpack-contrib/css-loader
                        // https://stackoverflow.com/questions/34039826/webpack-style-loader-vs-css-loader
                        loader: "css-loader",
                        options: {
                            // 设置 url 解析相对路径
                            root: path.resolve(__dirname, 'src/assets'),
                            // 启用CSS 模块标准，默认本地范围
                            modules: true,
                        }
                    },
                    {
                        // 将 Less 转成 CSS ，支持使用 ~ 来引用 node_modules 内的资源
                        loader: "less-loader",
                        options: {
                            javascriptEnabled: true,
                            // modifyVars: {
                            //     'primary-color': '#1DA57A',
                            //     'link-color': '#1DA57A',
                            //     'border-radius-base': '2px',
                            // },
                        },

                    }
                ]
            },
            // 处理 CSS 和 Less 文件
            {
                test: /\.(css|less)$/,
                include: /node_modules/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader",
                    },
                    {
                        loader: "less-loader",
                        options: {
                            javascriptEnabled: true,
                        },
                    }
                ]
            },
        ]
    },
    // webpack 插件
    plugins: [
        new HtmlWebpackPlugin({
            // 配置模板
            template: './public/index.html'
        },
        new CleanWebpackPlugin())
    ]
};


if (isProd()) {
    module.exports = Object.assign({}, config, {

        // 告知 webpack 使用相应的内置调优机制
        // https://webpack.js.org/concepts/mode/
        mode: "production"

    })
} else {

    module.exports = Object.assign({}, config, {

        // 告知 webpack 使用相应的内置调优机制
        // https://webpack.js.org/concepts/mode/
        mode: "development",

        // 控制输出源代码详细级别，方便调试（取决于级别，可能影响性能）。正式环境禁止启用。
        // https://www.webpackjs.com/configuration/devtool/
        devtool: 'eval-source-map',

        // 本地开发服务器配置
        // https://www.webpackjs.com/configuration/dev-server/
        devServer: {
            // contentBase: "./public", // 本地项目路径，设置了会影响自动更新
            historyApiFallback: true, // 使用 HTML5 history api 技术，所有跳转以当前页面为准。

            // 这里配置以下参数没有效果
            // inline: true, // 局部重载
            // hot: true, // 热更新
            open: true, // 自动打开浏览器
        },
    })
}