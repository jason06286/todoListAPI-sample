const http = require('http');
const { v4: uuidv4 } = require('uuid');
const headers = require('./headers');
const { successHandle, errorHandle } = require('./handler');

const todos = []

const requestListener = (req, res) => {

    let body = ''
    req.on('data', chunk => {
        body += chunk
    })

    if (req.url === "/todos" && req.method === "GET") {
        successHandle(res, todos)
    } else if (req.url === "/todos" && req.method === "POST") {
        req.on('end', () => {
            try {
                const title = JSON.parse(body).title
                if (title !== undefined) {
                    todos.push({
                        title,
                        id: uuidv4()
                    })
                    successHandle(res, todos)
                } else {
                    errorHandle(res, 4003)
                }
            } catch (error) {
                errorHandle(res, 4002)
            }
        })
    } else if (req.url === "/todos" && req.method === "DELETE") {
        todos.length = 0
        successHandle(res, todos)
    } else if (req.url.startsWith('/todos/') && req.method === "DELETE") {
        const id = req.url.split('/').pop()
        const index = todos.findIndex(item => item.id === id)

        if (index !== -1) {
            todos.splice(index, 1)
            successHandle(res, todos)
        } else {
            errorHandle(res, 4004)
        }
    } else if (req.url.startsWith('/todos/') && req.method === "PATCH") {
        req.on('end', () => {
            try {
                const id = req.url.split('/').pop()
                const index = todos.findIndex(item => item.id === id)
                const title = JSON.parse(body).title

                if (index !== -1) {
                    if (title !== undefined) {
                        todos[index].title = title
                        successHandle(res, todos)
                    } else {
                        errorHandle(res, 4003)
                    }
                } else {
                    errorHandle(res, 4004)
                }
            } catch (error) {
                errorHandle(res, 4002)
            }
        })
    } else if (req.method === 'OPTIONS') {
        res.writeHead(200, headers)
        res.end()
    } else {
        errorHandle(res, 4001)
    }
}

const sever = http.createServer(requestListener)


const PORT = 3000

sever.listen(process.env.PORT || PORT, () => {
    console.log('Sever listening on port', PORT);
})
