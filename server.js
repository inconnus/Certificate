
const { createServer } = require('https')
const readline = require('readline')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const PORT = 3001

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost.key'),
  cert: fs.readFileSync('./certificates/localhost.crt')
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
const cmd = () => {
  rl.question('What do you think of Node.js? ', (answer) => {
    console.log(`Thank you for your valuable feedback: ${answer}`)
    cmd()
  })
  
}
app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)

  }).listen(PORT, err => {
    if (err) throw err
    console.log(`> Ready on https://localhost:${PORT}`)
    // cmd()
  })
})