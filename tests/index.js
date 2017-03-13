import Vue from 'vue'
import http from '../src'
import { expect } from 'chai'

function isDate(time) {
    return new Date(parseInt(time, 10)) instanceof Date
}

describe('Vue-http', () => {
    let params, loadingCallback

    params = { foo: 'bar' }
    window.alert = sinon.spy()
    loadingCallback = sinon.spy()
    
    Vue.use(http, {
        timeout: 2000,
        timestamp: true,
        loading: loadingCallback,
        root: `${location.protocol}//${location.hostname}:9877`
    })

    it('get', (done) => {
        Vue.http.get('get', { params }).then((res) => {
            expect(res.status).to.equal(200)
            expect(res.statusText).to.equal("OK")
            expect(res.data.foo).to.equal(params.foo)
            done()
        })
    })

    it('post', (done) => {
        Promise.all([Vue.http.post('post', params), Vue.http.post('post')]).then((res) => {
            expect(res[0].status).to.equal(200)
            expect(res[0].statusText).to.equal("OK")
            expect(res[0].data.foo).to.equal(params.foo)
            done()
        })
    })

    it('onLine', (done) => {
        Vue.http.get('get', Object.assign({}, { params }, {
            onLine: false
        })).then((res) => {
            expect(res.status).to.equal(200)
            expect(res.statusText).to.equal("OK")
            expect(res.data.foo).to.equal(params.foo)
            done()
        })
    })

    it ('duration', (done) => {
         Vue.http.get('get', Object.assign({}, { params }, {
            duration: 0
        })).then((res) => {
            expect(res.status).to.equal(200)
            expect(res.statusText).to.equal("OK")
            expect(res.data.foo).to.equal(params.foo)
            done()
        })
    })

    it('timestamp', (done) => {
        Promise.all([Vue.http.get('timestamp?a=1', { params }), Vue.http.post('timestamp', params)]).then((res) => {
            expect(res[0].status).to.equal(200)
            expect(res[0].statusText).to.equal("OK")
            expect(res[0].data.foo).to.equal(params.foo)
            expect(isDate(res[0].data.t)).to.equal(true)

            expect(res[1].status).to.equal(200)
            expect(res[1].statusText).to.equal("OK")
            expect(res[1].data.t).to.equal(undefined)
            expect(res[1].data.foo).to.equal(params.foo)
            done()
        })
    })

    it('timeout', (done) => {
        Vue.http.get('timeout')
        setTimeout(() => {
            expect(window.alert.callCount).to.equal(2)
            done()
        }, 2200)
    }).timeout(3000)

    it('loading', (done) => {
        Vue.http.get('loading')

        setTimeout(() => {
            expect(loadingCallback.callCount).to.equal(4)
            done()
        }, 2200)
    }).timeout(3000)

    it('repeat', (done) => {
        Vue.http.get('repeat', { params }).then((res) => {
            expect(res.status).to.equal(200)
            expect(res.data.foo).to.equal(params.foo)
            done()
        })

        Vue.http.get('repeat', {
            params
        })
    })

    it('format data', (done) => {
        Vue.http.get('data', { params }).then((res) => {
            expect(res.code).to.equal(20000)
            expect(res.message).to.equal('done')
            expect(res.data.foo).to.equal(params.foo)
            done()
        })
    })

    it('respone status: 4xx', (done) => {
        Vue.http.get('4xx')

        setTimeout(() => {
            expect(window.alert.callCount).to.equal(3)
            done()
        }, 2200)
    }).timeout(3000)

    it('response status: 5xx', (done) => {
        Vue.http.get('5xx')

        setTimeout(() => {
            expect(window.alert.callCount).to.equal(4)
            done()
        }, 2200)
    }).timeout(3000)

    it('headers', (done) => {
        Vue.http.get('headers', {
            headers: {
                Auth: 'test'
            }
        }).then((res) => {
            expect(res.status).to.equal(200)
            expect(res.data).to.equal('test')
            done()
        })
    })
})