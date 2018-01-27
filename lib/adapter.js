import * as Cucumber from 'cucumber'
import mockery from 'mockery'
import isGlob from 'is-glob'
import glob from 'glob'
import path from 'path'
import {getFeatures} from 'cucumber/lib/cli/helpers'

import {
    wrapCommands,
    executeHooksWithArgs,
    executeSync,
    executeAsync
} from 'wdio-sync'

import CucumberReporter from './reporter'
import HookRunner from './hookRunner'

const DEFAULT_TIMEOUT = 30000
const DEFAULT_OPTS = {
    backtrace: false, // <boolean> show full backtrace for errors
    compiler: [], // <string[]> ("extension:module") require files with the given EXTENSION after requiring MODULE (repeatable)
    failAmbiguousDefinitions: false, // <boolean> treat ambiguous definitions as errors
    failFast: false, // <boolean> abort the run on first failure
    ignoreUndefinedDefinitions: false, // <boolean> treat undefined definitions as warnings
    name: [], // <REGEXP[]> only execute the scenarios with name matching the expression (repeatable)
    profile: [], // <string> (name) specify the profile to use
    require: [], // <string> (file/dir/glob) require files before executing features
    snippetSyntax: undefined, // <string> specify a custom snippet syntax
    snippets: true, // <boolean> hide step definition snippets for pending steps
    source: true, // <boolean> hide source uris
    strict: false, // <boolean> fail if there are any undefined or pending steps
    tagExpression: '', // <string> (expression) only execute the features or scenarios with tags matching the expression
    tagsInTitle: false, // <boolean> add cucumber tags to feature or scenario name
    timeout: DEFAULT_TIMEOUT // <number> timeout for step definitions in milliseconds
}

/**
 * Cucumber runner
 */
class CucumberAdapter {
    constructor (cid, config, specs, capabilities) {
        this.cid = cid
        this.config = config
        this.specs = specs
        this.capabilities = capabilities

        this.cucumberOpts = Object.assign(DEFAULT_OPTS, config.cucumberOpts)
    }

    async run () {
        Cucumber.clearSupportCodeFns()

        wrapCommands(global.browser, this.config.beforeCommand, this.config.afterCommand)

        this.registerCompilers()
        this.loadSpecFiles()
        this.wrapSteps()
        this.setDefaultTimeout()

        const hookListener = new Cucumber.Formatter()
        const hookRunner = new HookRunner(hookListener, this.config)

        const reporterListener = new Cucumber.Formatter()
        let reporterOptions = {
            capabilities: this.capabilities,
            ignoreUndefinedDefinitions: Boolean(this.cucumberOpts.ignoreUndefinedDefinitions),
            failAmbiguousDefinitions: Boolean(this.cucumberOpts.failAmbiguousDefinitions),
            tagsInTitle: Boolean(this.cucumberOpts.tagsInTitle)
        }
        let reporter = new CucumberReporter(reporterListener, reporterOptions, this.cid, this.specs)

        const scenarioFilterOptions = {
            cwd: process.cwd(), featurePaths: this.specs, names: this.cucumberOpts.name, tagExpression: this.cucumberOpts.tagExpression
        }

        const runtime = new Cucumber.Runtime({
            features: getFeatures({featurePaths: this.specs, scenarioFilter: new Cucumber.ScenarioFilter(scenarioFilterOptions)}),
            listeners: [hookRunner.getListener(), reporter.getListener()],
            options: this.cucumberOpts,
            supportCodeLibrary: Cucumber.SupportCodeLibraryBuilder.build({cwd: process.cwd(), fns: Cucumber.getSupportCodeFns()})
        })

        await executeHooksWithArgs(this.config.before, [this.capabilities, this.specs])
        const result = await runtime.start() ? 0 : 1
        await executeHooksWithArgs(this.config.after, [result, this.capabilities, this.specs])
        await reporter.waitUntilSettled()

        return result
    }

    registerCompilers () {
        this.cucumberOpts.compiler.forEach(compiler => {
            const parts = compiler.split(':')
            require(parts[1])
        })
    }

    requiredFiles () {
        return this.cucumberOpts.require.reduce((files, requiredFile) => {
            if (isGlob(requiredFile)) {
                return files.concat(glob.sync(requiredFile))
            } else {
                return files.concat([requiredFile])
            }
        }, [])
    }

    loadSpecFiles () {
        // we use mockery to allow people to import 'our' cucumber even though their spec files are in their folders
        // because of that we don't have to attach anything to the global object, and the current cucumber spec files
        // should just work with no changes with this framework
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        })
        mockery.registerMock('cucumber', Cucumber)
        this.requiredFiles().forEach((codePath) => {
            let absolutePath
            if (path.isAbsolute(codePath)) {
                absolutePath = codePath
            } else {
                absolutePath = path.join(process.cwd(), codePath)
            }
            // This allows rerunning a stepDefinitions file
            delete require.cache[require.resolve(absolutePath)]
            require(absolutePath)
        })
        mockery.disable()
    }

    /**
     * wraps step definition code with sync/async runner with a retry option
     */
    wrapSteps () {
        Cucumber.defineSupportCode(({setDefinitionFunctionWrapper}) => {
            setDefinitionFunctionWrapper((fn, options = {}) => {
                let retryTest = isFinite(options.retry) ? parseInt(options.retry, 10) : 0
                let wrappedFunction = fn.name === 'async' || this.config.sync === false
                    ? this.wrapStepAsync(fn, retryTest) : this.wrapStepSync(fn, retryTest)
                return wrappedFunction
            })
        })
    }

    /**
     * wrap step definition to enable retry ability
     * @param  {Function} code       step definitoon
     * @param  {Number}   retryTest  amount of allowed repeats is case of a failure
     * @return {Function}            wrapped step definiton for sync WebdriverIO code
     */
    wrapStepSync (code, retryTest = 0) {
        return function (...args) {
            return new Promise((resolve, reject) => global.wdioSync(
                executeSync.bind(this, code, retryTest, args),
                (resultPromise) => resultPromise.then(resolve, reject)
            ).apply(this))
        }
    }

    /**
     * wrap step definition to enable retry ability
     * @param  {Function} code       step definitoon
     * @param  {Number}   retryTest  amount of allowed repeats is case of a failure
     * @return {Function}            wrapped step definiton for async WebdriverIO code
     */
    wrapStepAsync (code, retryTest = 0) {
        return function (...args) {
            return executeAsync.call(this, code, retryTest, args)
        }
    }

    setDefaultTimeout () {
        Cucumber.defineSupportCode(({setDefaultTimeout}) => {
            setDefaultTimeout(this.cucumberOpts.timeout)
        })
    }
}

const _CucumberAdapter = CucumberAdapter
const adapterFactory = {}

adapterFactory.run = async function (cid, config, specs, capabilities) {
    const adapter = new _CucumberAdapter(cid, config, specs, capabilities)
    const result = await adapter.run()
    return result
}

export default adapterFactory
export { CucumberAdapter, adapterFactory }
