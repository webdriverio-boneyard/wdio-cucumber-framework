var assert = require('assert')

var {defineSupportCode} = require('cucumber')

defineSupportCode(function ({Given, When, Then}) {
    Given('I go on the website {stringInDoubleQuotes}', {wrapperOptions: {retry: 2}}, function (url) {
        return browser.url(url)
    })

    When('I click on link {stringInDoubleQuotes}', function (selector) {
        return browser.click(selector)
    })

    Then('should the title of the page be {stringInDoubleQuotes}', function (expectedTitle) {
        return browser.getTitle().then((title) => {
            assert.equal(title, expectedTitle)
        })
    })
})
