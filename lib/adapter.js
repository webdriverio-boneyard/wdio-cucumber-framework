import {Runtime, SupportCodeLibraryBuilder, FeatureParser, getSupportCodeFns, defineSupportCode} from 'cucumber'
import {getFeatures} from 'cucumber/lib/cli/helpers'
import * as models from 'cucumber/lib/models/step_definition'
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
    failFast: false, // <boolean> abort the run on first failure
    name: [], // <REGEXP[]> only execute the scenarios with name matching the expression (repeatable)
    snippets: true, // <boolean> hide step definition snippets for pending steps
    source: true, // <boolean> hide source uris
    profile: [], // <string> (name) specify the profile to use
    require: [], // <string> (file/dir) require files before executing features
    snippetSyntax: undefined, // <string> specify a custom snippet syntax
    strict: false, // <boolean> fail if there are any undefined or pending steps
    tags: [], // <string[]> (expression) only execute the features or scenarios with tags matching the expression
    timeout: DEFAULT_TIMEOUT, // <number> timeout for step definitions in milliseconds
    tagsInTitle: false // <boolean> add cucumber tags to feature or scenario name
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
        this.origStepDefinition = models.StepDefinition
        // this.origLibrary = Cucumber.SupportCode.Library
    }

    async run () {
        let reporterOptions = {
            capabilities: this.capabilities,
            ignoreUndefinedDefinitions: Boolean(this.cucumberOpts.ignoreUndefinedDefinitions),
            failAmbiguousDefinitions: Boolean(this.cucumberOpts.failAmbiguousDefinitions),
            tagsInTitle: Boolean(this.cucumberOpts.tagsInTitle)
        }

        wrapCommands(global.browser, this.config.beforeCommand, this.config.afterCommand)
        console.log("Gozdecki: before runtime");
        this.cucumberOpts.require.forEach((codePath) => require(codePath))

        console.log("Gozdecki: running runtime");
        const config = this.config;
        const wrapStepAsync = this.wrapStepAsync;
        const wrapStepSync = this.wrapStepSync;

        defineSupportCode(function({setDefinitionFunctionWrapper}) {
            console.log("inside support code");
            setDefinitionFunctionWrapper(function (fn) {
                console.log("Gozdecki: config.sync",config.sync);
                // console.log("Gozdecki: fn.name",fn.constructor.name);
                let retryTest = isFinite(config.retry) ? parseInt(config.retry, 10) : 0

                console.log("Gozdecki: isAsync(fn) ",isAsync(fn) );
                let wrappedFunction = isAsync(fn) || config.sync === false
                    ? wrapStepAsync(fn, retryTest) : wrapStepSync(fn, retryTest)
                return wrappedFunction
            });
        });

        console.log("after define support code");
        //
        const runtime = new Runtime({
            features: getFeatures({featurePaths: this.specs, scenarioFilter: {matches: () => true}}),
            // listeners: formatters,
            options: this.cucumberOpts,
            supportCodeLibrary: SupportCodeLibraryBuilder.build({cwd: process.cwd(), fns: getSupportCodeFns()})
        })

        // let cucumberConf = Cli.Configuration(this.cucumberOpts, this.specs)
        // let runtime = Runtime(cucumberConf)

        // Cucumber.SupportCode.Library = this.getLibrary()

        // let reporter = new CucumberReporter(Cucumber.Listener(), reporterOptions, this.cid, this.specs)
        // runtime.attachListener(reporter.getListener())
        //
        // let hookRunner = new HookRunner(Cucumber.Listener(), this.config)
        // runtime.attachListener(hookRunner.getListener())

        await executeHooksWithArgs(this.config.before, [this.capabilities, this.specs])
        const result = await runtime.start()
        await executeHooksWithArgs(this.config.after, [result, this.capabilities, this.specs])
        // await reporter.waitUntilSettled()

        return result
    }

    /**
     * overwrites Cucumbers StepDefinition class to wrap step definiton code block in order
     * to enable retry and synchronous code execution using wdio-syncs fiber helpers
     */
    getStepDefinition () {
        let { origStepDefinition } = this
        return (pattern, options, code, uri, line) => {
            let retryTest = isFinite(options.retry) ? parseInt(options.retry, 10) : 0
            let wrappedCode = code.name === 'async' || this.config.sync === false
                ? this.wrapStepAsync(code, retryTest) : this.wrapStepSync(code, retryTest)

            let stepDefinition = origStepDefinition(pattern, options, wrappedCode, uri, line)
            stepDefinition.validCodeLengths = () => [0]
            return stepDefinition
        }
    }

    /**
     * overwrites Cucumbers Library class to set default timeout for cucumber steps and hooks
     */
    getLibrary () {
        let { origLibrary } = this
        return (supportCodeDefinition) => {
            let library = origLibrary(supportCodeDefinition)
            library.setDefaultTimeout(this.cucumberOpts.timeout)
            return library
        }
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


function isAsync (func) {
    const string = func.toString().trim();
    return !!(
        // native
        string.match(/^async /) ||
        // babel (this may change, but hey...)
        string.match(/return _ref[^\.]*\.apply/) ||
            string.match(/^function async/)
        // insert your other dirty transpiler check

        // there are other more complex situations that maybe require you to check the return line for a *promise*
    );
}