var path = require('path')
var { CucumberAdapter } = require('../build/adapter')

var conf = {
    cucumberOpts: {
        compiler: [],
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
        /**
         * Do not change the order of the specs
         */
        it('should not run when no compiler is defined', function () {
            global.browser = new WebdriverIO()
            global.browser.options = {}
            var adapter = new CucumberAdapter(0, conf, feature, {})
            global.browser.getPrototype = function () { return WebdriverIO.prototype }

            return adapter.run().then(() => {
                throw new Error('run should always fail')
            }, (e) => {
                e.should.not.equal(null, 'test ok!')
            })
        })

        it('should run if the compiler is defined', function () {
            conf.cucumberOpts.compiler.push('js:babel-register')

            global.browser = new WebdriverIO()
            global.browser.options = {}
            var adapter = new CucumberAdapter(0, conf, feature, {})
            global.browser.getPrototype = function () { return WebdriverIO.prototype }
            return adapter.run().then((res) => {
                res.should.equal(0, 'test ok!')
            })
        })
    })
    describe('should use the required files as defined in the options', function () {
        it('should allow globs in required files', function () {
            conf.cucumberOpts.compiler.push('js:babel-register')
            conf.cucumberOpts.require = [path.join(__dirname, 'fixtures/es*-definition.js')]

            global.browser = new WebdriverIO()
            global.browser.options = {}
            var adapter = new CucumberAdapter(0, conf, feature, {})
            global.browser.getPrototype = function () { return WebdriverIO.prototype }
            return adapter.run().then((res) => {
                res.should.equal(0, 'test ok!')
            })
        })
    })
})
