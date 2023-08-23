const express = require('express')
const app = express()

// Middlewares
app.set('view engine', 'ejs')
app.use(express.static('public'))

// Endpoints
app.get('/', (req, res) => {
	res.render('index', {
		title: 'Chat App | Global Room'
	})
})

app.get('/login', (req, res) => {
	res.render('login', {
		title: 'Chat App | Login'
	})
})

app.get('/register', (req, res) => {
	res.render('register', {
		title: 'Chat App | Create account'
	})
})

const PORT = process.env.PORT || 3000
app.listen(PORT)