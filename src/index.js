import http from 'vue-resource'

function plugin(Vue, opts) {
    opts = Object.assign({}, {
        root: '',
        headers: {},
        loading: noop,
        timeout: 20000,
        duration: 1000,
        timestamp: false,
        credentials: true,
        emulateJSON: false,
        emulateHTTP: false,
        error: errorHandler
    }, opts)

    Vue.use(http)
    Vue.http.options.root = opts.root
    Vue.http.headers.common = opts.headers
    Vue.http.options.timeout = opts.timeout
    Vue.http.options.duration = opts.duration
    Vue.http.options.emulateJSON = opts.emulateJSON
    Vue.http.options.emulateHTTP = opts.emulateHTTP
    Vue.http.options.credentials = opts.credentials

    requestTimeoutHandler(Vue, opts)
    requestLoadingHandler(Vue, opts)
    requestTimestampHandler(Vue, opts)
    requestRepeatHandler(Vue, opts)

    responseStatusHandler(Vue, opts)
    responseFormatDataHandler(Vue, opts)
}

function requestTimeoutHandler(Vue, opts) {
    Vue.http.interceptors.push((req, next) => {
        let before, time, timeout

        time = req.timeout
        before = req.before

        delete req.timeout

        req.before = function (req) {
            if (before && !before.call(this, req)) {
                return
            }

            timeout = setTimeout(() => {
                req.abort()

                next(req.respondWith(req.body, { status: 601 }))
            }, time)
        }

        next((res) => {
            clearTimeout(timeout)
        })
    })
}

function requestLoadingHandler(Vue, opts) {
    Vue.http.interceptors.push((req, next) => {
        if (req.duration === 0) {
            next()
        } else {
            let isShow, timeout

            timeout = setTimeout(() => {
                opts.loading(isShow = true)
            }, req.duration)

            next((res) => {
                clearTimeout(timeout)
                isShow && opts.loading(isShow = false)
            })
        }
    })
}

function requestRepeatHandler(Vue, opts) {
    let cache = []

    Vue.http.interceptors.push((req, next) => {
        let uid = ''

        if (req.method.toLowerCase() === 'get') {
            uid = `${req.method.toLowerCase()}${req.url}${req.params ? JSON.stringify(req.params) : ''}`
        }

        if (req.method.toLowerCase() === 'post') {
            uid = `${req.method.toLowerCase()}${req.url}${req.data ? JSON.stringify(req.data) : ''}`
        }
        
        if (cache.indexOf(uid) === -1) {
            cache.push(uid)

            next((res) => {
                cache.splice(cache.indexOf(uid), 1)
            })
        } else {
            next(req.respondWith(req.body, { status: 602 }))
        }
    })
}

function responseFormatDataHandler(Vue, opts) {
    Vue.http.interceptors.push((req, next) => {
        next((res) => {
            if (res.data && res.data.message && res.data.status && res.data.data) {
                res.message = res.data.message
                res.code = res.data.status
                res.data = res.data.data
            }
        })
    })
}

function responseStatusHandler(Vue, opts) {
    Vue.http.interceptors.push((req, next) => {
        next((res) => {
            if (res.status === 601) {
                return new Vue.Promise(opts.error.bind(null, '网络超时'))
            }

            if (res.status === 602) {
                return new Vue.Promise(() => {
                    console.error('The last request was in the pending state, not to send multiple requests')
                })
            }

            if (`${res.status}`.charAt(0) === '4') {
                return new Vue.Promise(opts.error.bind(null, '请求资源不存在'))
            }

            if (`${res.status}`.charAt(0) === '5') {
                return new Vue.Promise(opts.error.bind(null, '服务器繁忙，请稍后再试'))
            }
        })
    })
}

function requestTimestampHandler(Vue, opts) {
    Vue.http.interceptors.push((req, next) => {
        if (req.method.toLowerCase() === 'get' && opts.timestamp) {
            req.url = `${req.url}${req.url.indexOf('?') < 0 ? '?' : '&'}t=${Date.now()}`
        }

        next()
    })
}

function noop() { }

function errorHandler(message) {
    alert(message)
}

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(plugin)
}

export default plugin