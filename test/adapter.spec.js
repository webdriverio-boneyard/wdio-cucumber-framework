var path = require('path')
var { CucumberAdapter } = require('../build/adapter')

var conf = {
    cucumberOpts: {
        compiler: [
            // 'js:babel-register'
        ],
        require: [path.join(__dirname, '/fixtures/es6-definition.js')]
    }
}
var feature = ['./test/fixtures/es6.feature']

var NOOP = function () {}

var WebdriverIO = function () {}
WebdriverIO.prototype = {
    /**
     * task of this command is to add 1 so we can have a simple demo test like
     * browser.command(1).should.be.equal(2)
     */
    url: function () {
        return new Promise(function (resolve) {
            resolve('url')
        })
    }
}

process.send = NOOP

describe('adapter', function () {
    describe('should use the compiler as defined in the options', function () {
        it('should not run when no compiler is defined', async function () {
            global.browser = new WebdriverIO()
            global.browser.options = {}
            var adapter = new CucumberAdapter(0, conf, feature, {})
            global.browser.getPrototype = function () { return WebdriverIO.prototype }

            var exception = null

            try {
                (await adapter.run())
            } catch (e) {
                exception = e
            }

            console.log(exception)

            exception.should.not.equal(null, 'test ok!')
        })

        it('should run if the compiler is defined', async function () {
            conf.cucumberOpts.compiler.push('js:babel-register')

            global.browser = new WebdriverIO()
            global.browser.options = {}
            var adapter = new CucumberAdapter(0, conf, feature, {})
            global.browser.getPrototype = function () { return WebdriverIO.prototype };

            (await adapter.run()).should.equal(0, 'test ok!')
        })
    })
})
