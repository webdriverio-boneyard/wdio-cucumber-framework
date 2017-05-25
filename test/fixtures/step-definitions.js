var assert = require('assert')

var {defineSupportCode} = require('cucumber')

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
})
