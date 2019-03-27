import soMatchConf from './fixtures/tags.match.so.conf'
import scenarioMatchConf from './fixtures/tags.match.scenario.conf'
import noMatchConf from './fixtures/tags.no.match.conf'
import { CucumberAdapter } from '../lib/adapter'

const specs = ['./test/fixtures/tags.feature']

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
    })
}

process.send = NOOP

let timeToExecute
describe('Tag Match test', () => {
    describe('Test matching Tag found at Scenario Outline Example', () => {
        before(async () => {
            global.browser = new WebdriverIO()
            const adapter = new CucumberAdapter(0, soMatchConf, specs, {})
            global.browser.getPrototype = () => WebdriverIO.prototype

            const start = new Date().getTime();
            (await adapter.run()).should.be.equal(0, 'actual test failed')
            timeToExecute = new Date().getTime() - start
        })

        it('should take more than the expected amount of time to execute two test', () => {
            timeToExecute.should.be.above(10000)
        })
    })

    describe('Test matching Tag found at Scenario', () => {
        before(async () => {
            global.browser = new WebdriverIO()
            const adapter = new CucumberAdapter(0, scenarioMatchConf, specs, {})
            global.browser.getPrototype = () => WebdriverIO.prototype

            const start = new Date().getTime();
            (await adapter.run()).should.be.equal(0, 'actual test failed')
            timeToExecute = new Date().getTime() - start
        })

        it('should take more than the expected amount of time to execute one test', () => {
            timeToExecute.should.be.above(7000)
        })
    })

    describe('Test matching Tag not found', () => {
        before(async () => {
            global.browser = new WebdriverIO()
            global.browser.options = {}
            const adapter = new CucumberAdapter(0, noMatchConf, specs, {})
            global.browser.getPrototype = () => WebdriverIO.prototype

            const start = new Date().getTime();
            (await adapter.run()).should.be.equal(0, 'actual test failed')
            timeToExecute = new Date().getTime() - start
        })

        it('should take the less than the expected amount of time to execute no tests', () => {
            timeToExecute.should.be.below(6000)
        })
    })
})
