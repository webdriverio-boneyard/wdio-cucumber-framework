var assert = require('assert')

var {defineSupportCode} = require('cucumber');

global.syncAsync = {}

console.log("running sync-async-step-definitions");
defineSupportCode(function({Given, When, Then}) {
    console.log("exported function from sync-async-step-definitions");
    Given('I go on the website {stringInDoubleQuotes}', (url) => {
        console.log("Gozdecki: url",url);
        browser.url(url)
    })

    Then('I click on link {stringInDoubleQuotes}', (selector) => {
        console.log("Gozdecki: selector",selector);
        browser.click(selector)
    })

    Then('should the title of the page be {stringInDoubleQuotes}', (expectedTitle) => {
        console.log("Gozdecki: expectedTitle",expectedTitle);
        console.log("Gozdecki: browser.getTitle()",browser.getTitle());
        try {
            assert.equal(browser.getTitle(), expectedTitle)
        } catch(e) {
            console.log("Gozdecki: error in 1");
        }
    })
    Then('should true be true', () => {
        console.log("Gozdecki: true",true);
        assert(true, true);
        return true;
    })

    Given('I go on the website {stringInDoubleQuotes} the async way', function async (url) {
        console.log("Gozdecki: url async",url);
        let promise = browser.url(url)
        try {
            assert.equal(typeof promise.then, 'function')
        } catch(e) {
            console.log("Gozdecki: error in 4");
        }
        return promise
    })

    Then('I click on link {stringInDoubleQuotes} the async way', function async (selector) {
        console.log("Gozdecki: selector async",selector);
        let promise = browser.click(selector)
        try {
            assert.equal(typeof promise.then, 'function')
        } catch(e) {
            console.log("Gozdecki: error in 2");
        }
        return promise
    })

    Then('should the title of the page be {stringInDoubleQuotes} the async way', function async (expectedTitle) {
        console.log("Gozdecki: expectedTitle async",expectedTitle);
        return browser.getTitle().then((title) => {
            console.log("Gozdecki: title async finish",title);
            try {
                assert.equal(title, expectedTitle)
            } catch(e) {
                console.log("Gozdecki: error in 3");
            }
        })
    })
})
