let port = 8889
let app = require('koa')()
let koaBody = require('koa-body')

if (process.argv.slice(2).length) {
    port = process.argv.slice(2).shift()
}

app.use(koaBody())

app.use(function* (next) {
    this.set('Access-Control-Allow-Credentials', true)
    this.set('Access-Control-Allow-Origin', this.header.origin || this.origin)
    this.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Auth')

    yield next
})

app.use(function* (next) {
    let obj, qs

    obj = {}
    qs = this.querystring.length ? this.querystring.split('&') : []

    for (let index = 0; index < qs.length; index++) {
        let [key, value] = qs[index].split('=')
        obj[key] = value
    }

    this.qs = obj

    yield next
})

app.use(function* (next) {
    if (this.path === '/get') {
        this.body = this.qs
    } else {
        yield next
    }
})

app.use(function* (next) {
    if (this.path === '/post') {
        this.body = this.request.body
    } else {
        yield next
    }
})

app.use(function* (next) {
    if (this.path === '/timestamp') {
        if (this.method === 'GET') {
            this.body = this.qs
        } else {
            this.body = Object.assign({}, this.qs, this.request.body)
        }
    } else {
        yield next
    }
})

app.use(function* (next) {
    if (this.path === '/timeout') {
        this.body = yield timeout(2200)
    } else {
        yield next
    }
})

app.use(function* (next) {
    if (this.path === '/loading') {
        this.body = yield timeout(1500)
    } else {
        yield next
    }
})

app.use(function* (next) {
    if (this.path === '/repeat') {
        this.body = this.qs
    } else {
        yield next
    }
})

app.use(function* (next) {
    if(this.path === '/data') {
        this.body = {
            status: 20000,
            message: 'done',
            data: this.qs
        }
    }else {
        yield next
    }
})

app.use(function* (next) {
    if(this.path === '/4xx') {
        this.status = 404
    }else {
        yield next
    }
})

app.use(function* (next) {
    if(this.path === '/5xx') {
        this.status = 504
    }else {
        yield next
    }
})

app.use(function* (next) {
    if(this.path === '/headers') {
        this.body = this.headers.auth
    }else {
        yield next
    }
})

function timeout(time, result) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(result)
        }, time)
    })
}

app.listen(port)