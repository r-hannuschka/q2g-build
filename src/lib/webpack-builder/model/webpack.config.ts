import { Configuration } from "webpack";
import { WebpackService } from "../service/webpack.service";

const config = WebpackService.getInstance().getConfiguration();

const webpackConfig: Configuration = {

    optimization: {
        minimize: false,
    },

    context: config.getContextPath(),

    entry: config.getEntryFile(),

    module: {
        rules: [
            {
                test: /.*\.tsx?$/,
                use: [{
                    /**
                     * remove all require js import plugins like css! or html!
                     * otherwise bundle will fail
                     */
                    loader: "clean-requirejs-imports.loader",
                }, {
                    loader: "ts-loader",
                    options: {
                        configFile: config.getTsConfigFile(),
                    },
                }],
            },
            {
                test: /\.less$/,
                use: [{
                    loader: "style-loader",
                }, {
                    loader: "css-loader",
                }, {
                    loader: "less-loader",
                }],
            },
            {
                test: /\.css$/,
                use: [{
                    loader: "style-loader",
                    options: {
                        convertToAbsoluteUrls: true,
                    },
                }, {
                    loader: "css-loader",
                    options: {
                        importLoaders: 1,
                        modules: false,
                    },
                }],
            },
        ],
    },

    resolve: {
        extensions: [".ts", ".js"],
    },

    resolveLoader: {
        /**
         * tell webpack where to find our loaders
         * otherwise it will search in the current working directory
         * which is that directory which has consumed base_loader module
         */
        alias: {
            css: "css-loader",
            text: "raw-loader",
        },
        mainFields: ["loader", "main"],
        modules: config.getLoaderContextPaths(),
    },

    output: {
        filename: config.getOutFileName(),
        libraryTarget: "umd",
        path: config.getOutputDirectory(),
    },

    plugins: config.getPlugins(),
};

export default webpackConfig;