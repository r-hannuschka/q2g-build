import { resolve } from "path";
import { Config, IDataNode } from "rh-utils";
import { Compiler, Plugin } from "webpack";
import { IBuilder } from "../../api";
import { AppConfigProperties, WebpackOption } from "../../model";
import { OptionHelper } from "../../services";
import { WebpackConfigModel } from "./model/webpack-config.model";
import { CleanWebpackPlugin, LogPlugin } from "./plugins";
import { WebpackService } from "./service/webpack.service";

/**
 * builder for webpack to bundle all files
 *
 * @export
 * @class WebpackBuilder
 * @implements {IBuilder}
 */
export class WebpackBuilder implements IBuilder {

    protected configService: Config;

    private webpackService: WebpackService;

    private sourceRoot: string;

    public constructor() {

        this.webpackService = WebpackService.getInstance();
        this.configService  = Config.getInstance();
        this.sourceRoot     = this.configService.get(AppConfigProperties.sourceRoot);

        this.configureWebpack();
    }

    /**
     * configure webpack this will cause override if propertie
     * is allready set
     *
     * @param {IDataNode} config
     * @memberof WebpackBuilder
     */
    public configure(config: IDataNode): void {

        const options: IDataNode = OptionHelper.cleanOptions(config, WebpackOption);
        const errors: string[]   = OptionHelper.validateOptions(config, WebpackOption);

        if ( ! errors.length ) {
            for (const name in options) {
                if ( options.hasOwnProperty(name) ) {
                    this.webpackService.setOption(name, options[name]);
                }
            }
            // value = resolve(this.sourceRoot, config[property]);
        }
    }

    /**
     * run webpack compiler
     *
     * @memberof WebpackBuilder
     */
    public async run() {

        // add additional webpack plugins before we start
        this.webpackService.addPlugins( this.loadWebpackPlugins());

        const compiler: Compiler = await this.webpackService.getWebpack();
        compiler.run((err) => {
            if ( err ) {
                process.stderr.write(err.toString());
            }
        });
    }

    /**
     * create default configuration, override this to add / change configuration
     * properties
     *
     * @protected
     * @memberof WebpackBuilder
     */
    protected configureWebpack(): WebpackConfigModel {

        const sourceRoot = this.sourceRoot;

        /** @var {string} q2gBuilderSource q2g-build path in source package node_modules folder */
        const q2gBuilderSource = `${sourceRoot}/node_modules/q2g-build/bin`;

        /** @var {string} q2gLoaderContext own loader paths */
        const q2gLoaderContext = resolve(q2gBuilderSource, "./lib/webpack-builder/loader");

        const config = this.webpackService.getConfiguration();
        config.setContextPath(sourceRoot);
        config.setEntryFile("./app/index.ts");
        config.setOutputDirectory(`${sourceRoot}/dist`);
        config.setOutFileName(`bundle.js`);
        config.setTsConfigFile(`${sourceRoot}/tsconfig.json`);
        config.setLoaderContextPaths([
            // vendor loader path (aka ts-loader, css-loader, ...)
            resolve(q2gBuilderSource, "../node_modules"),
            // q2g-build loader path
            q2gLoaderContext,
        ]);
        return config;
    }

    /**
     * load webpack plugins into webpack configuration model
     *
     * @protected
     * @returns {Plugin[]}
     * @memberof WebpackBuilder
     */
    protected loadWebpackPlugins(): Plugin[] {
        const config = this.webpackService.getConfiguration();
        const plugins: Plugin[] = [
            new LogPlugin(),
            new CleanWebpackPlugin(config.getOutputDirectory(), {allowExternal: true}),
        ];
        return plugins;
    }
}