const path = require('path')
const term = require('terminal-kit').terminal
const moment = require('moment-timezone')

const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use(express.static('public'))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

server.listen(3000, term.blue("Server started\n"))

let oldMsgList = []
let onlineUsersList = []
// Handle conversation here
io.on('connection', socket => {
	// Track online users
	socket.on("user-connect", (username) => {
		term.green(`[User connected] Username: ${username}\n`)
		if(onlineUsersList.length) {
			socket.emit("online-users-list", onlineUsersList)
		}
		if(oldMsgList.length) {
			socket.emit("old-msg-list", oldMsgList)
		}
		
		socket.username = username
		socket.broadcast.emit("user-connected", { username, id: socket.id })
		onlineUsersList.push({ username, id: socket.id })
	})
	
	socket.on("disconnect", () => {
		term.red(`[User disconnected] Username: ${socket.username}\n`)
		io.emit("user-disconnected", { username: socket.username, id: socket.id })
		onlineUsersList = onlineUsersList.filter((user) => {
			return user.id !== socket.id
		})
	})
	
	// Communication
	socket.on("send-message", (msgData) => {
		msgData['time'] = moment().tz('Asia/Manila').format('hh:mma')
		oldMsgList.push(msgData)
		socket.broadcast.emit("receive-message", msgData)
	})
})