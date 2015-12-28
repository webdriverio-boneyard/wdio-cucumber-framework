import Cucumber from 'cucumber'
import merge from 'deepmerge'
import glob from 'glob'
import { wdioSync, wrapCommands, executeHooksWithArgs } from 'wdio-sync'

import CucumberReporter from './reporter'

const EXEC_CUCUMBER = ['node', 'node_modules/.bin/cucumber']
const REQUIRE_FLAG = '-r'
const TAG_FLAG = '-t'
const FORMAT_FLAG = '-f'

/**
 * Cucumber runner
 */
class CucumberAdapter {
    constructor (cid, config, specs, capabilities) {
        this.cid = cid
        this.config = Object.assign({
            cucumberOpts: {}
        }, config)
        this.specs = specs
        this.capabilities = capabilities
        this.execOptions = []
        this.origAstTreeWalker = Cucumber.Runtime.AstTreeWalker
    }

    async run (config, specs, capabilities) {
        let execOptions = EXEC_CUCUMBER.concat(specs)
        let reporterOptions = {
            capabilities: capabilities,
            ignoreUndefinedDefinitions: false
        }

        /**
         * Set up exec options for Cucumber
         */
        this.execOptions = this.execOptions.concat(this.getRequiredFiles())
        this.execOptions = this.execOptions.concat(this.getTagParams())
        this.execOptions = this.execOptions.concat(this.getFormatParam())

        /**
         * Process Cucumber 'coffee' param
         */
        if (this.cucumberOpts.coffee) {
            this.execOptions.push('--coffee')
        }

        /**
         * Process Cucumber 'no-snippets' param
         */
        if (this.cucumberOpts.noSnippets) {
            this.execOptions.push('--no-snippets')
        }

        /**
         * Process WebdriverIOs 'ignoreUndefinedDefinitions' param
         */
        reporterOptions.ignoreUndefinedDefinitions = !!this.cucumberOpts.ignoreUndefinedDefinitions

        wrapCommands(global.browser, this.config.beforeCommand, this.config.afterCommand)

        global.cucumber = Cucumber.Cli(execOptions)
        let cucumberConf = Cucumber.Cli.Configuration(execOptions)
        let runtime = Cucumber.Runtime(cucumberConf)

        Cucumber.Runtime.AstTreeWalker = this.getAstTreeWalker()

        let reporter = new CucumberReporter(Cucumber.Listener(), reporterOptions)
        runtime.attachListener(reporter.getListener())

        await executeHooksWithArgs(this.config.before, [this.capabilities, this.specs])
        let result = await new Promise((resolve) => {
            runtime.start(() => {
                resolve(reporter.failedCount)
            })
        })
        await executeHooksWithArgs(this.config.after, [result, this.capabilities, this.specs])

        return result
    }

    /**
     * Process Cucumber Require param
     */
    getRequiredFiles () {
        if (!this.cucumberOpts.require) {
            return []
        }

        let cucumberResolvedRequire = this.getFilePaths(this.cucumberOpts.require)
        if (!cucumberResolvedRequire || cucumberResolvedRequire.length === 0) {
            return []
        }

        return cucumberResolvedRequire.reduce((a, fn) => {
            return a.concat(REQUIRE_FLAG, fn)
        }, [])
    }

    /**
     * Process Cucumber Tag param
     */
    getTagParams () {
        const tags = this.cucumberOpts.tags

        if (typeof tags === 'string') {
            return [TAG_FLAG, tags]
        } else if (!tags || !Array.isArray(tags)) {
            return []
        }

        let ret = []
        for (let tag of tags) {
            ret.push(TAG_FLAG)
            ret.push(tag)
        }

        return ret
    }

    /**
     * Process Cucumber Format param
     */
    getFormatParam () {
        if (typeof this.cucumberOpts.format !== 'string') {
            return []
        }

        return [FORMAT_FLAG, this.cucumberOpts.format]
    }

    getAstTreeWalker () {
        return (features, supportCodeLibrary, listeners, options) => {
            let astTreeWalker = this.origAstTreeWalker(features, supportCodeLibrary, listeners, options)
            let executeStep = astTreeWalker.executeStep
            astTreeWalker.executeStep = (step, stepDefinition, callback) => {
                return executeStep(wdioSync(step, stepDefinition, callback))
            }

            return astTreeWalker
        }
    }

    /**
     * returns a flatten list of globed files
     *
     * @param  {String[]} filenames  list of files to glob
     * @return {String[]} list of files
     */
    static getFilePaths (patterns, omitWarnings) {
        let files = []

        for (let pattern of patterns) {
            let filenames = glob.sync(pattern)

            filenames = filenames.filter(path =>
                path.slice(-3) === '.js' ||
                path.slice(-8) === '.feature' ||
                path.slice(-7) === '.coffee')

            filenames = filenames.map(path =>
                process.cwd() + '/' + path)

            if (filenames.length === 0 && !omitWarnings) {
                console.warn('pattern', pattern, 'did not match any file')
            }

            files = merge(files, filenames)
        }

        return files
    }
}

const _CucumberAdapter = CucumberAdapter
const adapterFactory = {}

adapterFactory.run = async function (cid, config, specs, capabilities) {
    const adapter = new _CucumberAdapter(cid, config, specs, capabilities)
    return await adapter.run()
}

export default adapterFactory
export { CucumberAdapter, adapterFactory }
