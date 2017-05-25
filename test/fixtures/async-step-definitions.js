var assert = require('assert')
console.log('requiring async step definitions')

var {defineSupportCode} = require('cucumber')

defineSupportCode(function ({Given, When, Then}) {
    console.log('running the define support code 2')
    Given('I go on the website {stringInDoubleQuotes}', {retry: 2}, function (url) {
        console.log('something 2')
        return browser.url(url)
    })

    When('I click on link {stringInDoubleQuotes}', function (selector) {
        console.log('click async 2')
        return browser.click(selector)
    })

    Then('should the title of the page be {stringInDoubleQuotes}', function (expectedTitle) {
        console.log('Gozdecki: getTitle async 2')
        return browser.getTitle().then((title) => {
            assert.equal(title, expectedTitle)
        })
    })
})
