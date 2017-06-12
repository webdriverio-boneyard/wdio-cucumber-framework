var assert = require('assert')

var {defineSupportCode} = require('cucumber')

let retryTest = 0
let lastCommand

global.syncAsync = {}

defineSupportCode(function ({Given, When, Then}) {
    Given('I go on the website {stringInDoubleQuotes} that can fail one time', {wrapperOptions: {retry: 1}}, (url) => {
        let res = browser.url(url)
        if (retryTest !== 0) {
            retryTest--
            throw new Error('FLAKE!')
        }
        lastCommand = res
    })

    Given('I set retryTest to {stringInDoubleQuotes}', (cnt) => {
        retryTest = parseInt(cnt, 10)
    })

    Given('I go on the website {stringInDoubleQuotes} the async way', {wrapperOptions: {retry: 3}}, function async (url) {
        return browser.url(url).then((res) => {
            if (retryTest !== 0) {
                retryTest--
                throw new Error('FLAKE!')
            }
            lastCommand = res
        })
    })

    Then('should the title of the page be {stringInDoubleQuotes}', {wrapperOptions: {retry: 2}}, (expectedTitle) => {
        let title = browser.getTitle()
        if (retryTest !== 0) {
            retryTest--
            throw new Error('FLAKE!')
        }
        assert.equal(title, expectedTitle)
        lastCommand = 'getTitle'
    })

    Then('I click on link {stringInDoubleQuotes} the async way', {wrapperOptions: {retry: 2}}, function async (selector) {
        if (retryTest !== 0) {
            retryTest--
            throw new Error('FLAKE!')
        }
        lastCommand = 'click'
        return browser.click(selector)
    })

    Then('the last command should be {stringInDoubleQuotes}', (expectedLastCommand) => {
        assert.equal(expectedLastCommand, lastCommand)
        lastCommand = null
    })
})
