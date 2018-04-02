import { CucumberAdapter } from '../lib/adapter'
import configNativePromises from './fixtures/cucumber-hooks.conf'
const specs = ['./test/fixtures/sample.feature']

const NOOP = () => {}

const WebdriverIO = class {}
WebdriverIO.prototype = {
    /**
     * task of this command is to add 1 so we can have a simple demo test like
     * browser.command(1).should.be.equal(2)
     */
    url: () => new Promise((resolve) => {
        setTimeout(() => resolve(), 100)
    }),
    click: () => new Promise((resolve) => {
        setTimeout(() => resolve(), 100)
    }),
    getTitle: (ms = 100) => new Promise((resolve) => {
        setTimeout(() => resolve('Google'), ms)
    }),
    pause: (ms = 100) => new Promise((resolve) => {
        setTimeout(() => resolve(), ms)
    }),
    addCommand: (name, fn) => {
        WebdriverIO.prototype[name] = fn
    }
}

process.send = NOOP

describe('Executes feature files with cucumber hooks', () => {
    it('should get executed', async () => {
        global.browser = new WebdriverIO()
        global.browser.options = {}
        const adapter = new CucumberAdapter(0, configNativePromises, specs, configNativePromises.capabilities)
        global.browser.getPrototype = () => WebdriverIO.prototype;
        (await adapter.run()).should.be.equal(0, 'actual test failed')
    })

    after(() => {
        delete global.browser
    })
})
