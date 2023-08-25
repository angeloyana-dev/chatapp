const activeUserListContainer = document.getElementById("activeUserListContainer")
const activeUserList = document.getElementById("activeUserList")
const oldMessagesContainer = document.getElementById("oldMessagesContainer")
const messagesContainer = document.getElementById("messagesContainer")
const msgInput = document.getElementById("msgInput")
const sendBtn = document.getElementById("sendBtn")

/*** SOCKET CONVERSATION ***/
const socket = io()
socket.on('connect', () => {
	updateActiveUserList('add', id, username)
	socket.emit('user-connect', { id, name: username })
})

socket.on('user-connected', (user) => {
	updateActiveUserList('add', user.id, user.name)
})

socket.on('user-disconnected', (user) => {
	updateActiveUserList('remove', user.id)
})

socket.on('active-users-list', (list) => {
	list.forEach((user) => {
		updateActiveUserList('add', user.id, user.name)
	})
})

socket.on('receive-old-messages', (messages) => {
	messages.forEach((msg) => {
		const type = msg.id === id && 'self'
		createMsgContainer(oldMessagesContainer, msg.name, msg.message, msg.timeSent, type)
	})
	messagesContainer.scrollTop = messagesContainer.scrollHeight
})

sendBtn.addEventListener('click', () => {
	// Return if input is empty
	if(!msgInput.value) return msgInput.select()
	
	const time = moment.tz('Asia/Manila').format('MM/DD/YY hh:mma')
	createMsgContainer(messagesContainer, username, msgInput.value, time, 'self')
	socket.emit('send-message', {
		id,
		name: username,
		message: msgInput.value,
		timeSent: time
	})
	msgInput.value = ''
	msgInput.select()
})

socket.on('receive-message', (msg) => {
	createMsgContainer(messagesContainer, msg.name, msg.message, msg.time)
})

/*** ------------------- ***/

// Generate elements
function updateActiveUserList(type, userId, userName){
	if(type === 'remove') {
		const elementToRemove = activeUserList.querySelector(`[data-user-id="${userId}"]`)
		console.log(elementToRemove)
		elementToRemove.remove()
	} else {
		const wrapper = document.createElement('li')
		wrapper.innerText = userName
		wrapper.dataset.userId = userId
		activeUserList.append(wrapper)
	}
}

function createMsgContainer(where, userName, msg, time, type){
	const container = document.createElement('div')
	const wrapper = document.createElement('div')
	const nameTextbox = document.createElement('span')
	const msgTextbox = document.createElement('p')
	const timeTextbox = document.createElement('span')
	
	const wrapperType = type === 'self' ? 'user-msg-wrapper' : 'other-msg-wrapper'
	container.classList.add(wrapperType)
	nameTextbox.innerText = userName
	msgTextbox.innerText = msg
	timeTextbox.innerText = time
	timeTextbox.classList.add('time')
	
	const scrollPosition = messagesContainer.scrollTop + messagesContainer.clientHeight
	const scrollHeight = messagesContainer.scrollHeight
	const isBottom = scrollPosition >= scrollHeight
	
	wrapper.append(nameTextbox, msgTextbox)
	container.append(wrapper, timeTextbox)
	where.append(container)
	autoScrollDown(isBottom, scrollHeight)
}

// Dynamic Functions
function toggleActiveUserList(method){
	if(method === 'open') {
		return activeUserListContainer.style.width = "70%"
	}
	activeUserListContainer.style.width = "0"
}

function autoScrollDown(isBottom, scrollHeight){
	if(isBottom) {
		messagesContainer.scrollTop = scrollHeight
	}
}

window.addEventListener('resize', () => {
	messagesContainer.scrollTop = messagesContainer.scrollHeight
})