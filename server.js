const path = require('path')
const term = require('terminal-kit').terminal

const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use(express.static('public'))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

server.listen(3000, term.green("Server started\n"))

// Handle conversation here
io.on('connection', socket => {
	
})