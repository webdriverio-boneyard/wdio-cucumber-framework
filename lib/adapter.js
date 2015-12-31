import Cucumber from 'cucumber'
import { wrapCommands, executeHooksWithArgs } from 'wdio-sync'

import CucumberReporter from './reporter'
import HookRunner from './hookRunner'

const DEFAULT_TIMEOUT = 30000
const DEFAULT_FORMAT = 'pretty'
const DEFAULT_OPTS = {
    backtrace: false, // <boolean> show full backtrace for errors
    compiler: [], // <string[]> ("extension:module") require files with the given EXTENSION after requiring MODULE (repeatable)
    dryRun: false, // <boolean> invoke formatters without executing steps
    failFast: false, // <boolean> abort the run on first failure
    format: [DEFAULT_FORMAT], // <string[]> (type[:path]) specify the output format, optionally supply PATH to redirect formatter output (repeatable)
    colors: true, // <boolean> disable colors in formatter output
    snippets: true, // <boolean> hide step definition snippets for pending steps
    source: true, // <boolean> hide source uris
    profile: [], // <string> (name) specify the profile to use
    require: [], // <string> (file/dir) require files before executing features
    snippetSyntax: undefined, // <string> specify a custom snippet syntax
    strict: false, // fail if there are any undefined or pending steps
    tags: [], // <string[]> (expression) only execute the features or scenarios with tags matching the expression
    timeout: DEFAULT_TIMEOUT // timeout for step definitions
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

        this.origStepDefinition = Cucumber.SupportCode.StepDefinition
        this.origAstTreeWalker = Cucumber.Runtime.AstTreeWalker
    }

    async run () {
        let reporterOptions = {
            capabilities: this.capabilities,
            ignoreUndefinedDefinitions: !!this.cucumberOpts.ignoreUndefinedDefinitions
        }

        wrapCommands(global.browser, this.config.beforeCommand, this.config.afterCommand)

        let cucumberConf = Cucumber.Cli.Configuration(this.cucumberOpts, this.specs)
        let runtime = Cucumber.Runtime(cucumberConf)

        Cucumber.SupportCode.StepDefinition = this.getStepDefinition()
        Cucumber.Runtime.AstTreeWalker = this.getAstTreeWalker()

        let reporter = new CucumberReporter(Cucumber.Listener(), reporterOptions, this.cid)
        runtime.attachListener(reporter.getListener())

        let hookRunner = new HookRunner(Cucumber.Listener(), this.config)
        runtime.attachListener(hookRunner.getListener())

        await executeHooksWithArgs(this.config.before, [this.capabilities, this.specs])
        let result = await new Promise((resolve) => {
            runtime.start(() => {
                resolve(reporter.failedCount)
            })
        })
        await executeHooksWithArgs(this.config.after, [result, this.capabilities, this.specs])

        return result
    }

    getStepDefinition () {
        let { origStepDefinition } = this
        return (pattern, options, code, uri, line) => {
            let stepDefinition = origStepDefinition(pattern, options, this.wrapStep(code), uri, line)
            stepDefinition.validCodeLengths = () => [0]
            return stepDefinition
        }
    }

    getAstTreeWalker () {
        let { origAstTreeWalker } = this
        return (features, supportCodeLibrary, listeners, options) => {
            supportCodeLibrary.setDefaultTimeout(this.cucumberOpts.timeout)
            return origAstTreeWalker(features, supportCodeLibrary, listeners, options)
        }
    }

    wrapStep (code) {
        return function (...args) {
            return new Promise((r) => global.wdioSync(code, r).apply(this, args))
        }
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
