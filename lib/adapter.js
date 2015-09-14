import Cucumber from 'cucumber'
import CucumberReporter from './reporter'
import runBefore from 'wdio-sync'

let adapter

/**
 * Cucumber runner
 */
adapter.run = async function(config, specs, capabilities) {
    let execOptions = ['node', 'node_modules/.bin/cucumber'].concat(specs)
    let reporterOptions = {
        capabilities: capabilities,
        ignoreUndefinedDefinitions: false
    }

    /**
     * Set up exec options for Cucumber
     */
    if (config.cucumberOpts) {
        /**
         * Process Cucumber Require param
         */
        if (config.cucumberOpts.require) {
            let cucumberResolvedRequire = null // getFilePaths(config.cucumberOpts.require)
            if (cucumberResolvedRequire && cucumberResolvedRequire.length) {
                execOptions = cucumberResolvedRequire.reduce((a, fn) => {
                    return a.concat('-r', fn)
                }, execOptions)
            }
        }

        /**
         * Process Cucumber Tag param
         */
        if (Array.isArray(config.cucumberOpts.tags)) {
            for (let tag of config.cucumberOpts.tags) {
                execOptions.push('-t')
                execOptions.push(tag)
            }
        } else if (config.cucumberOpts.tags) {
            execOptions.push('-t')
            execOptions.push(config.cucumberOpts.tags)
        }

        /**
         * Process Cucumber Format param
         */
        if (config.cucumberOpts.format) {
            execOptions.push('-f')
            execOptions.push(config.cucumberOpts.format)
        }

        /**
         * Process Cucumber 'coffee' param
         */
        if (config.cucumberOpts.coffee) {
            execOptions.push('--coffee')
        }

        /**
         * Process Cucumber 'no-snippets' param
         */
        if (config.cucumberOpts.noSnippets) {
            execOptions.push('--no-snippets')
        }

        /**
         * Process WebdriverIOs 'ignoreUndefinedDefinitions' param
         */
        if (config.cucumberOpts.ignoreUndefinedDefinitions) {
            reporterOptions.ignoreUndefinedDefinitions =
                config.cucumberOpts.ignoreUndefinedDefinitions
        }
    }

    global.cucumber = Cucumber.Cli(execOptions)
    let cucumberConf = Cucumber.Cli.Configuration(execOptions)
    let runtime = Cucumber.Runtime(cucumberConf)
    let reporter = new CucumberReporter(Cucumber.Listener(), reporterOptions)

    runtime.attachListener(reporter.getListener())

    await runBefore(config.before)

    return new Promise((resolve) => {
        runtime.start(() => {
            resolve(reporter.failedCount)
        })
    })
}

export { adapter }
