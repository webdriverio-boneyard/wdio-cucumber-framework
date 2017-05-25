var assert = require('assert')

var {defineSupportCode} = require('cucumber')

global.syncAsync = {}

defineSupportCode(function ({Given, When, Then}) {
    Given('I go on the website {stringInDoubleQuotes}', (url) => {
        browser.url(url)
    })

    Then('I click on link {stringInDoubleQuotes}', (selector) => {
        browser.click(selector)
    })

    Then('should the title of the page be {stringInDoubleQuotes}', (expectedTitle) => {
        assert.equal(browser.getTitle(), expectedTitle)
    })

    Given('I go on the website {stringInDoubleQuotes} the async way', function async (url) {
        let promise = browser.url(url)

        assert.equal(typeof promise.then, 'function')

        return promise
    })

    Then('I click on link {stringInDoubleQuotes} the async way', function async (selector) {
        let promise = browser.click(selector)
        assert.equal(typeof promise.then, 'function')
        return promise
    })

    Then('should the title of the page be {stringInDoubleQuotes} the async way', function async (expectedTitle) {
        return browser.getTitle().then((title) => {
            assert.equal(title, expectedTitle)
        })
    })
})
