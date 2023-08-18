// Global variables
const currentMsgWrapper = document.getElementById("current-msg-wrapper")
const userInputMsg = document.getElementById("inputMsg")
const sendMsgBtn = document.getElementById("sendMsgBtn")
const onlineUserList = document.getElementById("onlineUserList")

// Username prompt
let username = window.prompt("Enter your username")
let isValidUsername = false
while(!isValidUsername) {
	if(username === null || username === ''){
		username = window.prompt("Please enter a valid characters")
	} else if(username.length > 10) {
		username = window.prompt("Username can't be bigger than 10 characters")
	} else {
		isValidUsername = true
	}
}

const socket = io()
// Handle conversation here
// Updates online users list
socket.on("connect", () => {
	createGreet(username)
	updateUsersList("add", socket.id, username)
	socket.emit("user-connect", username)
})

socket.on("online-users-list", (serverUsersList) => {
	serverUsersList.forEach((user) => {
		updateUsersList("add", user.id, user.username)
	})
})

socket.on("user-connected", (userData) => {
	updateUsersList("add", userData.id, userData.username)
})

socket.on("user-disconnected", (userData) => {
	updateUsersList("remove", userData.id)
})

// Communication
sendMsgBtn.addEventListener('click', () => {
	if(!userInputMsg.value.length) return userInputMsg.select()
	
	createMsgContainer(username, userInputMsg.value, getTime(), true)
	socket.emit("send-message", {
		username,
		message: userInputMsg.value
	})
	userInputMsg.value = ''
})

socket.on("receive-message", (msgData) => {
	createMsgContainer(msgData.username, msgData.message, getTime())
})

// Messages generator
function createGreet(username){
	const container = document.createElement('div')
	const wrapper = document.createElement('div')
	      
	container.classList.add('greet-msg-container')
	wrapper.innerText = `Welcome to Chat app ${username}`
	container.append(wrapper)
	currentMsgWrapper.append(container)
}

function updateUsersList(method, id, username){
	if(method === "remove"){
		const userToRemove = onlineUserList.querySelector(`[data-id=${id}]`)
		return userToRemove.remove()
	} else if(method === "add"){
		const usernameTextbox = document.createElement('li')
		usernameTextbox.innerText = username
		usernameTextbox.dataset.id = id
		onlineUserList.append(usernameTextbox)
	}
}

function createMsgContainer(username, message, time, isUserMsg){
	const container = document.createElement('div')
	const wrapper = document.createElement('div')
	const msgTextbox = document.createElement('p')
	const usernameTextbox = document.createElement('span')
	const timeTextbox = document.createElement('span')
	
	container.classList.add(isUserMsg ? "user-msg-container" : "others-msg-container")
	msgTextbox.innerText = message
	usernameTextbox.innerText = username
	timeTextbox.innerText = time
	
	wrapper.append(usernameTextbox, msgTextbox, timeTextbox)
	container.append(wrapper)
	currentMsgWrapper.append(container)
}

// Dynamic DOM
const usersList = document.getElementById("usersListContainer")
function openUsersList(){
	usersList.style.width = "65%"
}

function closeUsersList(){
	usersList.style.width = "0"
}

function getTime(){
	const date = new Date()
	let hour = date.getHours().toString()
	let minute = date.getMinutes().toString()
	
	let status = hour >= 12 ? "pm" : "am"
	hour = hour > 12 ? hour - 12 : hour
	minute = minute.length === 2 ? minute : `0${minute}`
	return `${hour}:${minute}${status}`
}