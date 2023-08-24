const activeUserListContainer = document.getElementById("activeUserListContainer")
const activeUserList = document.getElementById("activeUserList")
const messagesContainer = document.getElementById("messagesContainer")
const msgInput = document.getElementById("msgInput")
const sendBtn = document.getElementById("sendBtn")
sendBtn.addEventListener('click', () => {
	// Return if input is empty
	if(!msgInput.value) return msgInput.select()
	createMsgContainer('user001', msgInput.value, 'self')
	msgInput.value = ''
})

// Generate elements
function updateActiveUserList(type, userId, userName){
	if(type === 'remove') {
		const elementToRemove = activeUserList.querySelector(`[data-user-id=${userId}]`)
		elementToRemove.remove()
	} else {
		const wrapper = document.createElement('li')
		wrapper.innerText = userName
		wrapper.dataset.userId = userId
		activeUserList.append(wrapper)
	}
}

function createMsgContainer(userName, msg, type){
	const container = document.createElement('div')
	const wrapper = document.createElement('div')
	const nameTextbox = document.createElement('span')
	const msgTextbox = document.createElement('p')
	
	const wrapperType = type === 'self' ? 'user-msg-wrapper' : 'other-msg-wrapper'
	container.classList.add(wrapperType)
	nameTextbox.innerText = userName
	msgTextbox.innerText = msg
	
	const scrollPosition = messagesContainer.scrollTop + messagesContainer.clientHeight
	const scrollHeight = messagesContainer.scrollHeight
	const isBottom = scrollPosition >= scrollHeight
	
	wrapper.append(nameTextbox, msgTextbox)
	container.append(wrapper)
	messagesContainer.append(container)
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