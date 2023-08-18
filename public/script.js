// Username prompt
let username = window.prompt("Enter your username")
let isValidUsername = false
while(!isValidUsername) {
	if(username === null || username === undefined){
		username = window.prompt("Please enter a valid characters")
	} else if(username.length > 10) {
		username = window.prompt("Username can't be bigger than 10 characters")
	} else {
		isValidUsername = true
	}
}

const socket = io()
// Handle conversation here

// Dynamic DOM
const usersList = document.getElementById("usersListContainer")
function openUsersList(){
	usersList.style.width = "65%"
}

function closeUsersList(){
	usersList.style.width = "0"
}