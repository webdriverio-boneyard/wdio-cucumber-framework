var assert = require('assert')
console.log("requiring async step definitions");

var {defineSupportCode} = require('cucumber');

defineSupportCode(function({Given, When, Then}) {
    console.log("running the define support code");
    Given('I go on the website {stringInDoubleQuotes}', function(url) {
        console.log("something ")
        return browser.url(url)
    });

    When('I click on link {stringInDoubleQuotes}', function (selector) {
        return browser.click(selector)

    });

    Then('should the title of the page be {stringInDoubleQuotes}', function (expectedTitle) {
        return browser.getTitle().then((title) => {
            assert.equal(title, expectedTitle)
        })
    });
});