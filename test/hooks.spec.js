import configQPromises from './fixtures/hooks.using.q.promises'
import configNativePromises from './fixtures/hooks.using.native.promises'
import configWDIOCommands from './fixtures/hooks.using.wdio.commands'
import configCustomCommands from './fixtures/hooks.using.custom.commands'
import configAsyncCommands from './fixtures/hooks.using.async.conf'
import { CucumberAdapter } from '../lib/adapter'

const specs = ['./test/fixtures/sample.feature']
const customCommandSpecs = ['./test/fixtures/custom-commands.feature']

const NOOP = () => {}

const WebdriverIO = class {}
WebdriverIO.prototype = {
    /**
     * task of this command is to add 1 so we can have a simple demo test like
     * browser.command(1).should.be.equal(2)
     */
    url: () => new Promise((resolve) => {
        setTimeout(() => resolve(), 2000)
    }),
    click: () => new Promise((resolve) => {
        setTimeout(() => resolve(), 2000)
    }),
    getTitle: (ms = 500) => new Promise((resolve) => {
        setTimeout(() => resolve('Google'), ms)
    }),
    pause: (ms = 500) => new Promise((resolve) => {
        setTimeout(() => resolve(), ms)
    }),
    addCommand: (name, fn) => {
        WebdriverIO.prototype[name] = fn
    }
}

process.send = NOOP

describe('CucumberAdapter executes hooks using native Promises', () => {
    before(async () => {
        global.browser = new WebdriverIO()
        global.browser.options = {}
        const adapter = new CucumberAdapter(0, configNativePromises, specs, configNativePromises.capabilities)
        global.browser.getPrototype = () => WebdriverIO.prototype;
        (await adapter.run()).should.be.equal(0, 'actual test failed')
    })

    describe('before', () => {
        let beforeHook

        before(() => {
            beforeHook = global._wdio.before
        })

        it('should get executed', () => {
            beforeHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeHook.end - beforeHook.start
            duration.should.be.greaterThan(490)
        })

        it('should contain capabilities and spec parameters', () => {
            beforeHook.args[0].should.be.equal(configNativePromises.capabilities)
            beforeHook.args[1].should.be.equal(specs)
        })
    })

    describe('beforeFeature', () => {
        let beforeFeatureHook

        before(() => {
            beforeFeatureHook = global._wdio.beforeFeature
        })

        it('should get executed', () => {
            beforeFeatureHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeFeatureHook.end - beforeFeatureHook.start
            duration.should.be.greaterThan(490)
        })

        it('should contain right feature data', () => {
            let feature = beforeFeatureHook.args[0]
            feature.name.should.be.equal('Example feature')
        })
    })

    describe('beforeScenario', () => {
        let beforeScenarioHook

        before(() => {
            beforeScenarioHook = global._wdio.beforeScenario
        })

        it('should get executed', () => {
            beforeScenarioHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeScenarioHook.end - beforeScenarioHook.start
            duration.should.be.greaterThan(490)
        })

        it('should contain right scenario data', () => {
            let scenario = beforeScenarioHook.args[0]
            scenario.name.should.be.equal('Foo Bar')
        })
    })

    describe('beforeStep', () => {
        let beforeStepHook

        before(() => {
            beforeStepHook = global._wdio.beforeStep
        })

        it('should get executed', () => {
            beforeStepHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeStepHook.end - beforeStepHook.start
            duration.should.be.greaterThan(490)
        })

        it('should contain right step data', () => {
            let step = beforeStepHook.args[0]
            step.name.should.be.equal(`should the title of the page be "Google"`)
        })
    })

    describe('beforeCommand', () => {
        let beforeCommandHook

        before(() => {
            beforeCommandHook = global._wdio.beforeCommand
        })

        it('should get executed', () => {
            beforeCommandHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeCommandHook.end - beforeCommandHook.start
            duration.should.be.greaterThan(490)
        })

        it('should contain right command parameter', () => {
            beforeCommandHook.args[0].should.be.equal('getTitle')
        })
    })

    describe('afterCommand', () => {
        let afterCommandHook

        before(() => {
            afterCommandHook = global._wdio.afterCommand
        })

        it('should get executed', () => {
            afterCommandHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterCommandHook.end - afterCommandHook.start
            duration.should.be.greaterThan(490)
        })

        it('should contain right command parameter', () => {
            afterCommandHook.args[0].should.be.equal('getTitle')
            afterCommandHook.args[2].should.be.equal('Google')
        })
    })

    describe('afterStep', () => {
        let afterStepHook

        before(() => {
            afterStepHook = global._wdio.afterStep
        })

        it('should get executed', () => {
            afterStepHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterStepHook.end - afterStepHook.start
            duration.should.be.greaterThan(490)
        })

        it('should contain right step data', () => {
            let step = afterStepHook.args[0].step
            step.name.should.be.equal(`should the title of the page be "Google"`)
        })
    })

    describe('afterScenario', () => {
        let afterScenarioHook

        before(() => {
            afterScenarioHook = global._wdio.afterScenario
        })

        it('should get executed', () => {
            afterScenarioHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterScenarioHook.end - afterScenarioHook.start
            duration.should.be.greaterThan(490)
        })

        it('should contain right scenario data', () => {
            let scenario = afterScenarioHook.args[0]
            scenario.name.should.be.equal('Foo Bar')
        })
    })

    describe('afterFeature', () => {
        let afterFeatureHook

        before(() => {
            afterFeatureHook = global._wdio.afterFeature
        })

        it('should get executed', () => {
            afterFeatureHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterFeatureHook.end - afterFeatureHook.start
            duration.should.be.greaterThan(490)
        })

        it('should contain right feature data', () => {
            let feature = afterFeatureHook.args[0]
            feature.name.should.be.equal('Example feature')
        })
    })

    describe('after', () => {
        let afterHook

        before(() => {
            afterHook = global._wdio.after
        })

        it('should get executed', () => {
            afterHook.wasExecuted.should.be.true()
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterHook.end - afterHook.start
            duration.should.be.greaterThan(490)
        })

        it('should contain capabilities and spec parameters', () => {
            afterHook.args[0].should.be.equal(0)
            afterHook.args[1].should.be.equal(configNativePromises.capabilities)
            afterHook.args[2].should.be.equal(specs)
        })
    })

    after(() => {
        delete global.browser
    })
})

describe('CucumberAdapter executes hooks using WDIO commands', () => {
    before(async () => {
        global.browser = new WebdriverIO()
        global.browser.options = {}
        const adapter = new CucumberAdapter(0, configWDIOCommands, specs, configWDIOCommands.capabilities)
        global.browser.getPrototype = () => WebdriverIO.prototype;
        (await adapter.run()).should.be.equal(0, 'actual test failed')
    })

    describe('before', () => {
        let beforeHook

        before(() => {
            beforeHook = global.__wdio.before
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeHook.end - beforeHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeFeature', () => {
        let beforeFeatureHook

        before(() => {
            beforeFeatureHook = global.__wdio.beforeFeature
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeFeatureHook.end - beforeFeatureHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeScenario', () => {
        let beforeScenarioHook

        before(() => {
            beforeScenarioHook = global.__wdio.beforeScenario
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeScenarioHook.end - beforeScenarioHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeStep', () => {
        let beforeStepHook

        before(() => {
            beforeStepHook = global.__wdio.beforeStep
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeStepHook.end - beforeStepHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeCommand', () => {
        let beforeCommandHook

        before(() => {
            beforeCommandHook = global.__wdio.beforeCommand
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeCommandHook.end - beforeCommandHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterCommand', () => {
        let afterCommandHook

        before(() => {
            afterCommandHook = global.__wdio.afterCommand
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterCommandHook.end - afterCommandHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterStep', () => {
        let afterStepHook

        before(() => {
            afterStepHook = global.__wdio.afterStep
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterStepHook.end - afterStepHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterScenario', () => {
        let afterScenarioHook

        before(() => {
            afterScenarioHook = global.__wdio.afterScenario
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterScenarioHook.end - afterScenarioHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterFeature', () => {
        let afterFeatureHook

        before(() => {
            afterFeatureHook = global.__wdio.afterFeature
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterFeatureHook.end - afterFeatureHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('after', () => {
        let afterHook

        before(() => {
            afterHook = global.__wdio.after
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterHook.end - afterHook.start
            duration.should.be.greaterThan(490)
        })
    })

    after(() => {
        delete global.browser
    })
})

describe('CucumberAdapter executes hooks using 3rd party libs (q library)', () => {
    before(async () => {
        global.browser = new WebdriverIO()
        global.browser.options = {}
        const adapter = new CucumberAdapter(0, configQPromises, specs, configQPromises.capabilities)
        global.browser.getPrototype = () => WebdriverIO.prototype;
        (await adapter.run()).should.be.equal(0, 'actual test failed')
    })

    describe('before', () => {
        let beforeHook

        before(() => {
            beforeHook = global.___wdio.before
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeHook.end - beforeHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeFeature', () => {
        let beforeFeatureHook

        before(() => {
            beforeFeatureHook = global.___wdio.beforeFeature
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeFeatureHook.end - beforeFeatureHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeScenario', () => {
        let beforeScenarioHook

        before(() => {
            beforeScenarioHook = global.___wdio.beforeScenario
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeScenarioHook.end - beforeScenarioHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeStep', () => {
        let beforeStepHook

        before(() => {
            beforeStepHook = global.___wdio.beforeStep
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeStepHook.end - beforeStepHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeCommand', () => {
        let beforeCommandHook

        before(() => {
            beforeCommandHook = global.___wdio.beforeCommand
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeCommandHook.end - beforeCommandHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterCommand', () => {
        let afterCommandHook

        before(() => {
            afterCommandHook = global.___wdio.afterCommand
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterCommandHook.end - afterCommandHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterStep', () => {
        let afterStepHook

        before(() => {
            afterStepHook = global.___wdio.afterStep
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterStepHook.end - afterStepHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterScenario', () => {
        let afterScenarioHook

        before(() => {
            afterScenarioHook = global.___wdio.afterScenario
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterScenarioHook.end - afterScenarioHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterFeature', () => {
        let afterFeatureHook

        before(() => {
            afterFeatureHook = global.___wdio.afterFeature
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterFeatureHook.end - afterFeatureHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('after', () => {
        let afterHook

        before(() => {
            afterHook = global.___wdio.after
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterHook.end - afterHook.start
            duration.should.be.greaterThan(490)
        })
    })

    after(() => {
        delete global.browser
    })
})

describe('CucumberAdapter executes custom commands', () => {
    before(async () => {
        global.browser = new WebdriverIO()
        global.browser.options = {}
        const adapter = new CucumberAdapter(0, configCustomCommands, customCommandSpecs, configCustomCommands.capabilities)
        global.browser.getPrototype = () => WebdriverIO.prototype;
        (await adapter.run()).should.be.equal(0, 'actual test failed')
    })

    it('should defer execution until custom wdio command completes', () => {
        let duration = global.____wdio.customWdio.end - global.____wdio.customWdio.start
        duration.should.be.greaterThan(990)
    })

    it('should defer execution until custom wdio promise command resolves', () => {
        let duration = global.____wdio.customWdioPromise.end - global.____wdio.customWdioPromise.start
        duration.should.be.greaterThan(990)
    })

    it('should defer execution until custom native promise command resolves', () => {
        let duration = global.____wdio.customNativePromise.end - global.____wdio.customNativePromise.start
        duration.should.be.greaterThan(990)
    })

    it('should defer execution until custom q promise command resolves', () => {
        let duration = global.____wdio.customQPromise.end - global.____wdio.customQPromise.start
        duration.should.be.greaterThan(990)
    })

    it('should defer execution until custom command wrapping custom wdio command resolves', () => {
        let duration = global.____wdio.customWrapWdio.end - global.____wdio.customWrapWdio.start
        duration.should.be.greaterThan(990)
    })

    it('should defer execution until custom command wrapping custom wdio promise command resolves', () => {
        let duration = global.____wdio.customWrapWdioPromise.end - global.____wdio.customWrapWdioPromise.start
        duration.should.be.greaterThan(990)
    })

    it('should defer execution until custom command wrapping two native promise commands resolves', () => {
        let duration = global.____wdio.customWrapTwoPromises.end - global.____wdio.customWrapTwoPromises.start
        duration.should.be.greaterThan(1990)
    })

    it('should defer execution until custom command wrapping wdio comamnd treated as promise resolves', () => {
        let duration = global.____wdio.customHandleWdioAsPromise.end - global.____wdio.customHandleWdioAsPromise.start
        duration.should.be.greaterThan(1990)
    })

    after(() => {
        delete global.browser
    })
})

describe('CucumberAdapter executes async hooks', () => {
    before(async () => {
        global.browser = new WebdriverIO()
        global.browser.options = { sync: false }
        const adapter = new CucumberAdapter(0, configAsyncCommands, specs, {})
        global.browser.getPrototype = () => WebdriverIO.prototype;
        (await adapter.run()).should.be.equal(0, 'actual test failed')
    })

    describe('before', () => {
        let beforeHook

        before(() => {
            beforeHook = global._____wdio.before
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeHook.end - beforeHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeFeature', () => {
        let beforeFeatureHook

        before(() => {
            beforeFeatureHook = global._____wdio.beforeFeature
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeFeatureHook.end - beforeFeatureHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeScenario', () => {
        let beforeScenarioHook

        before(() => {
            beforeScenarioHook = global._____wdio.beforeScenario
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeScenarioHook.end - beforeScenarioHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('beforeStep', () => {
        let beforeStepHook

        before(() => {
            beforeStepHook = global._____wdio.beforeStep
        })

        it('should defer execution until promise was resolved', () => {
            let duration = beforeStepHook.end - beforeStepHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterStep', () => {
        let afterStepHook

        before(() => {
            afterStepHook = global._____wdio.afterStep
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterStepHook.end - afterStepHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterScenario', () => {
        let afterScenarioHook

        before(() => {
            afterScenarioHook = global._____wdio.afterScenario
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterScenarioHook.end - afterScenarioHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('afterFeature', () => {
        let afterFeatureHook

        before(() => {
            afterFeatureHook = global._____wdio.afterFeature
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterFeatureHook.end - afterFeatureHook.start
            duration.should.be.greaterThan(490)
        })
    })

    describe('after', () => {
        let afterHook

        before(() => {
            afterHook = global._____wdio.after
        })

        it('should defer execution until promise was resolved', () => {
            let duration = afterHook.end - afterHook.start
            duration.should.be.greaterThan(490)
        })
    })

    after(() => {
        delete global.browser
    })
})
