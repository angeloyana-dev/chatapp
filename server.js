require('dotenv').config()
const { MongoClient } = require('mongodb')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const methodOverride = require('method-override')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcryptjs')
const flash = require('express-flash')
const session = require('express-session')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)


// Middlewares
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false
}))
app.use(flash())
app.use(methodOverride('_method'))

// Passport and MongoDB configurations
app.use(passport.initialize())
app.use(passport.session())
initializeLocalStrategy()
const client = new MongoClient(
	process.env.DB_URL, { useNewUrlParser : true }
)

// Endpoints
app.get('/', checkAuthHome, (req, res) => {
	res.render('index', {
		title: 'Chat App | Global Room',
		user: req.user
	})
})

app.get('/login', checkAuth, (req, res) => {
	res.render('login', {
		title: 'Chat App | Login'
	})
})

app.get('/register', checkAuth, (req, res) => {
	res.render('register', {
		title: 'Chat App | Create account',
		errorFlash: req.flash('error') || null
	})
})

// Handle form submission
app.post('/login', checkAuth, passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: 'login',
	failureFlash: true
}))

app.post('/register', checkAuth, async (req, res) => {
	if(req.body.name.length > 12) {
		req.flash('error', "Name length can't be higher than 12 characters")
		return res.redirect('/register')
	}
	const existingUser = await client.db(process.env.DB_NAME).collection(process.env.USERS_CREDENTIAL_COLLECTION).find({ username: req.body.username }).limit(1).toArray()
	if(existingUser.length) {
		req.flash('error', 'Username is already taken.')
		res.redirect('/register')
	} else {
		try {
			// Save to database
			const hashedPassword = bcrypt.hashSync(req.body.password, 10)
			const user = {
				id: uuidv4(),
				name: req.body.name,
				username: req.body.username,
				password: hashedPassword
			}
			await client.db(process.env.DB_NAME).collection(process.env.USERS_CREDENTIAL_COLLECTION).insertOne(user)
			res.redirect('/login')
			
		} catch(err) {
			console.log(err.toString())
			req.flash('error', 'Server error, please try again.')
			res.redirect('/register')
		}
	}
})

app.delete('/logout', (req, res) => {
	req.logout(() => {
		res.redirect('/login')
	})
})

// Start server
start()
async function start() {
	await client.connect()
	const PORT = process.env.PORT || 3000
	server.listen(PORT)
}

/*** SOCKET CONVERSATION ***/
let activeUsersList = []
io.on('connection', socket => {
	socket.on('user-connect', async (user) => {
		socket.emit('active-users-list', activeUsersList)
		socket.broadcast.emit('user-connected', user)
		const oldMessages = await client.db(process.env.DB_NAME).collection(process.env.MESSAGES_COLLECTION).find().toArray()
		socket.emit('receive-old-messages', oldMessages)
		socket.userId = user.id
		socket.name = user.name
		activeUsersList.push(user)
	})
	
	socket.on('disconnect', () => {
		activeUsersList = activeUsersList.filter((user) => {
			return user.id !== socket.userId
		})
		io.emit('user-disconnected', { id: socket.userId, name: socket.name })
	})
	
	socket.on('send-message', async (msg) => {
		await client.db(process.env.DB_NAME).collection(process.env.MESSAGES_COLLECTION).insertOne(msg)
		socket.broadcast.emit('receive-message', msg)
	})
})
/*** ------------------- ***/
// Middleware Functions
function initializeLocalStrategy(){
	passport.use(new LocalStrategy(async (username, password, done) => {
		const user = await client.db(process.env.DB_NAME).collection(process.env.USERS_CREDENTIAL_COLLECTION).find({ username: username }).limit(1).toArray()
		
		if(!user.length) return done(null, false, { message: "User is not yet registered." })
		if(!bcrypt.compareSync(password, user[0].password)) return done(null, false, { message: "Username and password did not match." })
		
		done(null, user[0])
	}))
	
	passport.serializeUser((user, done) => {
		done(null, user.id)
	})
	
	passport.deserializeUser(async (id, done) => {
		const user = await client.db(process.env.DB_NAME).collection(process.env.USERS_CREDENTIAL_COLLECTION).find({ id: id }).limit(1).toArray()
		done(null, user[0])
	})
}

function checkAuthHome(req, res, next){
	if(!req.isAuthenticated()) return res.redirect('/login')
	next()
}

function checkAuth(req, res, next){
	if(req.isAuthenticated()) return res.redirect('/')
	next()
}