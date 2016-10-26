import q from 'q'

browser.addCommand('customWdio', function (a) {
    browser.pause(1000)
    return a + 1
})

browser.addCommand('customWdioPromise', function async (a) {
    return browser.pause(1000)
    .then(() => {
        return a + 1
    })
})

browser.addCommand('customNativePromise', function async (a) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(a + 1)
        }, 1000)
    })
})

browser.addCommand('customQPromise', function async (a) {
    const defer = q.defer()
    setTimeout(() => {
        defer.resolve(a + 1)
    }, 1000)
    return defer.promise
})

browser.addCommand('customWrapWdio', function (a) {
    const b = browser.customWdio(a)
    return b + 1
})

browser.addCommand('customWrapWdioPromise', function (a) {
    const b = browser.customWdioPromise(a)
    return b + 1
})

browser.addCommand('customWrapTwoPromises', function (a) {
    global.____wdio.customWrapTwoPromises.start = new Date().getTime()
    return new Promise((resolve) => {
        const b = browser.customWdioPromise(a)
        const c = browser.customNativePromise(b)
        global.____wdio.customWrapTwoPromises.end = new Date().getTime()
        resolve(c)
    })
})

browser.addCommand('customHandleWdioAsPromise', function async (a) {
    return browser.pause(1000).then(() => browser.customWdio(a).then((b) => {
        return b + 1
    }))
})

module.exports = function () {
    this.Then(/^custom wdio$/, () => {
        global.____wdio.customWdio.start = new Date().getTime()
        browser.customWdio(1).should.be.equal(2)
        global.____wdio.customWdio.end = new Date().getTime()
    })

    this.Then(/^custom wdio promise$/, () => {
        global.____wdio.customWdioPromise.start = new Date().getTime()
        browser.customWdioPromise(1).should.be.equal(2)
        global.____wdio.customWdioPromise.end = new Date().getTime()
    })

    this.Then(/^custom native promise$/, () => {
        global.____wdio.customNativePromise.start = new Date().getTime()
        browser.customNativePromise(1).should.be.equal(2)
        global.____wdio.customNativePromise.end = new Date().getTime()
    })

    this.Then(/^custom q promise$/, () => {
        global.____wdio.customQPromise.start = new Date().getTime()
        browser.customQPromise(1).should.be.equal(2)
        global.____wdio.customQPromise.end = new Date().getTime()
    })

    this.Then(/^custom command wrapping custom wdio$/, () => {
        global.____wdio.customWrapWdio.start = new Date().getTime()
        browser.customWrapWdio(1).should.be.equal(3)
        global.____wdio.customWrapWdio.end = new Date().getTime()
    })

    this.Then(/^custom command wrapping custom wdio promise$/, () => {
        global.____wdio.customWrapWdioPromise.start = new Date().getTime()
        browser.customWrapWdioPromise(1).should.be.equal(3)
        global.____wdio.customWrapWdioPromise.end = new Date().getTime()
    })

    this.Then(/^custom command wrapping two native promise commands$/, () => {
        global.____wdio.customWrapTwoPromises.start = new Date().getTime()
        browser.customWrapTwoPromises(1).should.be.equal(3)
        global.____wdio.customWrapTwoPromises.end = new Date().getTime()
    })

    this.Then(/^custom command wrapping wdio command treated as promise resolves$/, () => {
        global.____wdio.customHandleWdioAsPromise.start = new Date().getTime()
        browser.customHandleWdioAsPromise(1).should.be.equal(3)
        global.____wdio.customHandleWdioAsPromise.end = new Date().getTime()
    })
}
